import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { injectIntl } from "react-intl";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Fab } from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import PrintIcon from "@material-ui/icons/ListAlt";
import {
  historyPush,
  withModulesManager,
  withHistory,
  withTooltip,
  formatMessage,
  decodeId,
  clearCurrentPaginationPage,
} from "@openimis/fe-core";
import InsureeSearcher from "../components/InsureeSearcher";
import { print, printMembershipCard } from "../actions";

import { RIGHT_INSUREE_ADD, RIGHT_PRINT } from "../constants";

const styles = (theme) => ({
  page: theme.page,
  fab: theme.fab,
});

class InsureesPage extends Component {
  state = {
    printParam: [],
  }
  onDoubleClick = (i, newTab = false) => {
    historyPush(this.props.modulesManager, this.props.history, "insuree.route.insuree", [i.uuid], newTab);
  };

  onAdd = () => {
    historyPush(this.props.modulesManager, this.props.history, "insuree.route.insuree");
  };

  printSelected = (selection) => {
    this.props.print(selection.map((i) => decodeId(i.id)));
  };

  printMembershipCardSelected = (selection) => {
    this.props.printMembershipCard(selection.map((i) => decodeId(i.id)));
  };

  canPrintSelected = (selection) =>
    !!selection && selection.length;

  componentDidMount = () => {
    const moduleName = "insuree";
    const { module } = this.props;
    if (module !== moduleName) this.props.clearCurrentPaginationPage();
  };

  componentWillUnmount = () => {
    const { location, history } = this.props;
    const {
      location: { pathname },
    } = history;
    const urlPath = location.pathname;
    if (!pathname.includes(urlPath)) this.props.clearCurrentPaginationPage();
  };

  render() {
    const { intl, classes, rights } = this.props;
    const { printParam } = this.state;
    var actions = [];
    actions.push({
      label: "insureeSummaries.printMembershipCardSelected",
      action: this.printSelected,
      enabled: this.canPrintSelected,
      icon: <PrintIcon />,
    });

    actions.push({
      label: "insureeSummaries.rightCertificate",
      action: this.printMembershipCardSelected,
      enabled: this.canPrintSelected,
      icon: <PrintIcon />,
    });
    return (
      <div className={classes.page}>
        <InsureeSearcher cacheFiltersKey="insureeInsureesPageFiltersCache" onDoubleClick={this.onDoubleClick} rights={rights} actions={actions} />
        {rights.includes(RIGHT_INSUREE_ADD) &&
          withTooltip(
            <div className={classes.fab}>
              <Fab color="primary" onClick={this.onAdd}>
                <AddIcon />
              </Fab>
            </div>,
            formatMessage(intl, "insuree", "addNewInsureeTooltip"),
          )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  module: state.core?.savedPagination?.module,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ clearCurrentPaginationPage, print, printMembershipCard }, dispatch);

export default injectIntl(
  withModulesManager(
    withHistory(connect(mapStateToProps, mapDispatchToProps)(withTheme(withStyles(styles)(InsureesPage)))),
  ),
);
