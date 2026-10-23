import React, { Component, Fragment } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { Checkbox, FormControlLabel, IconButton, Tooltip, Paper } from "@material-ui/core";
import TabIcon from "@material-ui/icons/Tab";
import {
  withModulesManager,
  formatMessageWithValues,
  formatDateFromISO,
  formatMessage,
  Searcher,
  journalize,
} from "@openimis/fe-core";

import { fetchFamilySummaries, deleteFamily } from "../actions";
import { Delete as DeleteIcon } from "@material-ui/icons";
import FamilyFilter from "./FamilyFilter";
import { DEFAULT, FAMILY_TYPE_POLYGAMY_CODE, RIGHT_FAMILY_DELETE } from "../constants";
import { familyLabel } from "../utils/utils";
import DeleteFamilyDialog from "./DeleteFamilyDialog";
import { withTheme, withStyles } from "@material-ui/core/styles";

const FAMILY_SEARCHER_CONTRIBUTION_KEY = "insuree.FamilySearcher";
const styles = (theme) => ({
  paper: theme.paper.paper,
  paperHeader: theme.paper.header,
  paperHeaderAction: theme.paper.action,
  tableTitle: theme.table.title,
  lockedPage: theme.page.locked,
  titleWithToggle: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
});
class FamilySearcher extends Component {
  state = {
    deleteFamily: null,
    parentFamily: null,
    parentFamilySet: false,
    reset: 0,
    canSelectParent: false,
    showDetailedColumns: false,
  };

  constructor(props) {
    super(props);
    this.rowsPerPageOptions = props.modulesManager.getConf(
      "fe-insuree",
      "familyFilter.rowsPerPageOptions",
      [10, 20, 50, 100],
    );
    this.defaultPageSize = props.modulesManager.getConf("fe-insuree", "familyFilter.defaultPageSize", 10);
    this.locationLevels = this.props.modulesManager.getConf("fe-location", "location.Location.MaxLevels", 4);
    this.renderLastNameFirst = props.modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  fetch = (prms) => {
    this.props.fetchFamilySummaries(this.props.modulesManager, prms);
  };

  rowIdentifier = (r) => r.uuid;

  filtersToQueryParams = (state) => {
    let prms = Object.keys(state.filters)
      .filter((family) => !!state.filters[family]["filter"])
      .map((family) => state.filters[family]["filter"]);
    if (!state.beforeCursor && !state.afterCursor) {
      prms.push(`first: ${state.pageSize}`);
    }
    if (!!state.afterCursor) {
      prms.push(`after: "${state.afterCursor}"`);
      prms.push(`first: ${state.pageSize}`);
    }
    if (!!state.beforeCursor) {
      prms.push(`before: "${state.beforeCursor}"`);
      prms.push(`last: ${state.pageSize}`);
    }
    if (!!state.orderBy) {
      prms.push(`orderBy: ["${state.orderBy}"]`);
    }
    if(!!state.canSelectParent && state.canSelectParent == true){
      prms.push(`familyType : ${FAMILY_TYPE_POLYGAMY_CODE}`)
    }
    return prms;
  };

  _toggleDetailedColumns = (event) => {
    this.setState({ showDetailedColumns: event.target.checked });
  };

  _tableTitle = (count) => {
    const { intl, classes } = this.props;
    return (
      <div className={classes.titleWithToggle}>
        <span>{formatMessageWithValues(intl, "insuree", "familySummaries", { count })}</span>
        <FormControlLabel
          control={
            <Checkbox
              color="primary"
              checked={this.state.showDetailedColumns}
              onChange={this._toggleDetailedColumns}
            />
          }
          label={formatMessage(intl, "insuree", "familySummaries.showSecondaryColumns")}
          classes={{ label: classes.toggleLabel }}
        />
      </div>
    );
  };

  headers = (filters) => {
    const h = [
      "insuree.familySummaries.shortInsuranceNo",
      this.renderLastNameFirst ? "insuree.familySummaries.shortLastName" : "insuree.familySummaries.shortOtherNames",
      !this.renderLastNameFirst ? "insuree.familySummaries.shortLastName" : "insuree.familySummaries.shortOtherNames",
      "insuree.familySummaries.shortPhone",
    ];
    if (this.state.showDetailedColumns) {
      h.push("insuree.familySummaries.email");
    }
    h.push("insuree.familySummaries.shortDob");
    if (this.props.selectParent && this.props.selectParent === true) {
      h.unshift("insuree.familySummaries.selectParent");
    }
    for (let i = 0; i < this.locationLevels; i++) {
      h.push(`location.locationType.${i}`);
    }
    h.push("insuree.familySummaries.poverty");
    if (this.state.showDetailedColumns) {
      h.push("insuree.familySummaries.confirmationNo");
    }
    if (filters?.showHistory?.value) {
      h.push("insuree.familySummaries.validityFrom", "insuree.familySummaries.validityTo");
    }
    h.push("insuree.familySummaries.openNewTab");
    if (!!this.props.rights.includes(RIGHT_FAMILY_DELETE)) {
      h.push("insuree.familySummaries.delete");
    }
    return h;
  };

  sorts = (filters) => {
    const results = [
      ["headInsuree__chfId", true],
      this.renderLastNameFirst ? ["headInsuree__lastName", true] : ["headInsuree__otherNames", true],
      !this.renderLastNameFirst ? ["headInsuree__lastName", true] : ["headInsuree__otherNames", true],
      ["headInsuree__phone", true],
    ];
    if (this.state.showDetailedColumns) {
      results.push(["headInsuree__email", true]);
    }
    results.push(["headInsuree__dob", true]);
    if (this.props.selectParent && this.props.selectParent === true) {
      results.unshift(null);
    }
    for (let i = 0; i < this.locationLevels; i++) {
      results.push(null);
    }
    results.push(null);
    if (this.state.showDetailedColumns) {
      results.push(["confirmationNo", true]);
    }
    if (filters?.showHistory?.value) {
      results.push(["validityFrom", false], ["validityTo", false]);
    }
    results.push(null);
    if (!!this.props.rights.includes(RIGHT_FAMILY_DELETE)) {
      results.push(null);
    }
    return results;
  };

  parentLocation = (location, level) => {
    if (!location) return "";
    let loc = location;
    for (var i = 1; i < this.locationLevels - level; i++) {
      if (!loc.parent) return "";
      loc = loc.parent;
    }
    return !!loc ? loc.name : "";
  };

  deleteFamilyAction = (i) =>
    !!i.validityTo ? null : (
      <Tooltip title={formatMessage(this.props.intl, "insuree", "familySummaries.deleteFamily.tooltip")}>
        <IconButton onClick={(e) => !i.clientMutationId && this.setState({ deleteFamily: i })}>
          <DeleteIcon />
        </IconButton>
      </Tooltip>
    );
  canCheckParentFamily = (i) => this.state.parentFamily != null && i == this.state.parentFamily;

  selectParentFamily = (i) => {
    const { parentFamily } = this.state;
    if (parentFamily !== i) {
      this.setState({
        parentFamily: i,
      });
      this.props.OnFamilySelect(i);
    } else {
      this.setState({
        parentFamily: null,
      });
    }
  };

  deleteFamily = (deleteMembers) => {
    let family = this.state.deleteFamily;
    this.setState({ deleteFamily: null }, (e) => {
      this.props.deleteFamily(
        this.props.modulesManager,
        family,
        deleteMembers,
        formatMessageWithValues(this.props.intl, "insuree", "deleteFamily.mutationLabel", {
          label: familyLabel(family),
        }),
      );
    });
  };

  itemFormatters = (filters) => {
    const formatters = [
      (family) => (!!family.headInsuree ? family.headInsuree.chfId : ""),
      (family) =>
        (family.headInsuree && this.renderLastNameFirst
          ? family.headInsuree.lastName
          : family.headInsuree.otherNames) || "",
      (family) =>
        (family.headInsuree && !this.renderLastNameFirst
          ? family.headInsuree.lastName
          : family.headInsuree.otherNames) || "",
      (family) => (!!family.headInsuree ? family.headInsuree.phone : ""),
    ];
    if (this.state.showDetailedColumns) {
      formatters.push((family) => (!!family.headInsuree ? family.headInsuree.email : ""));
    }
    formatters.push((family) =>
      !!family.headInsuree
        ? formatDateFromISO(this.props.modulesManager, this.props.intl, family.headInsuree.dob)
        : "",
    );
    if (this.props.selectParent && this.props.selectParent === true) {
      formatters.unshift((family) => (
        <Checkbox
          color="primary"
          checked={this.state.parentFamily === family}
          onClick={(e) => this.selectParentFamily(family)}
          readOnly
        />
      ));
    }
    for (let i = 0; i < this.locationLevels; i++) {
      let j = i + 0;
      formatters.push((family) => this.parentLocation(family.location, j));
    }
    formatters.push((family) => <Checkbox color="primary" checked={family.poverty} readOnly />);
    if (this.state.showDetailedColumns) {
      formatters.push((family) => family.confirmationNo);
    }
    if (filters?.showHistory?.value) {
      formatters.push(
        (family) => formatDateFromISO(this.props.modulesManager, this.props.intl, family.validityFrom),
        (family) => formatDateFromISO(this.props.modulesManager, this.props.intl, family.validityTo),
      );
    }
    formatters.push((family) => (
      <Tooltip title={formatMessage(this.props.intl, "insuree", "familySummaries.openNewTabButton.tooltip")}>
        <IconButton onClick={(e) => !family.clientMutationId && this.props.onDoubleClick(family, true)}>
          {" "}
          <TabIcon />
        </IconButton>
      </Tooltip>
    ));
    if (!!this.props.rights.includes(RIGHT_FAMILY_DELETE)) {
      formatters.push(this.deleteFamilyAction);
    }
    return formatters;
  };

  rowDisabled = (selection, i) => !!i.validityTo;
  rowLocked = (selection, i) => !!i.clientMutationId;

  render() {
    const {
      intl,
      families,
      familiesPageInfo,
      fetchingFamilies,
      fetchedFamilies,
      errorFamilies,
      filterPaneContributionsKey,
      cacheFiltersKey,
      onDoubleClick,
      actionsContributionKey,
      actions,
      classes,
      shouldBeLocked,
      canSelectMutiple,
      selectParent
    } = this.props;
    let count = familiesPageInfo.totalCount;
    return (
      
        <Fragment >
          <DeleteFamilyDialog
            family={this.state.deleteFamily}
            onConfirm={this.deleteFamily}
            onCancel={(e) => this.setState({ deleteFamily: null })}
          />
          <Searcher
            module="insuree"
            cacheFiltersKey={cacheFiltersKey}
            FilterPane={FamilyFilter}
            filterPaneContributionsKey={filterPaneContributionsKey}
            items={families}
            itemsPageInfo={familiesPageInfo}
            fetchingItems={fetchingFamilies}
            fetchedItems={fetchedFamilies}
            errorItems={errorFamilies}
            contributionKey={FAMILY_SEARCHER_CONTRIBUTION_KEY}
            tableTitle={this._tableTitle(count)}
            rowsPerPageOptions={this.rowsPerPageOptions}
            defaultPageSize={this.defaultPageSize}
            fetch={this.fetch}
            rowIdentifier={this.rowIdentifier}
            filtersToQueryParams={this.filtersToQueryParams}
            defaultOrderBy="-validityFrom"
            headers={this.headers}
            itemFormatters={this.itemFormatters}
            sorts={this.sorts}
            rowDisabled={shouldBeLocked == true ?  () => true :this.rowDisabled}
            rowLocked={shouldBeLocked == true ? () => true: this.rowLocked}
            onDoubleClick={(f) => !f.clientMutationId  && !selectParent && onDoubleClick(f)}
            reset={this.state.reset}
            actions={actions}
            actionsContributionKey={actionsContributionKey}
            withSelection={canSelectMutiple == false  ? null : "multiple"}
            isModal={this.props.isModal}
          />
        </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  families: state.insuree.families,
  familiesPageInfo: state.insuree.familiesPageInfo,
  fetchingFamilies: state.insuree.fetchingFamilies,
  fetchedFamilies: state.insuree.fetchedFamilies,
  errorFamilies: state.insuree.errorFamilies,
  submittingMutation: state.insuree.submittingMutation,
  mutation: state.insuree.mutation,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchFamilySummaries, deleteFamily, journalize }, dispatch);
};

export default withModulesManager(
  withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(injectIntl(FamilySearcher))),
);
