import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { injectIntl } from "react-intl";
import { fetchInsureeOfficers, fetchContextualEnrollmentOfficer } from "../actions";
import { formatMessage, AutoSuggestion, ProgressOrError, withModulesManager, decodeId } from "@openimis/fe-core";
import { DEFAULT } from "../constants";

const styles = (theme) => ({
  label: {
    color: theme.palette.primary.main,
  },
});

class InsureeOfficer extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-insuree", "InsureeOfficer.selectThreshold", 10);
    this.renderLastNameFirst = props.modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );
    this.isCurrentAdminEnrollmentOfficerActive = props.modulesManager.getConf("fe-insuree", "isCurrentAdminEnrollmentOfficerActive", true);
  }

  componentDidMount() {
    if (!this.props.fetchedInsureeOfficers || !this.isCurrentAdminEnrollmentOfficerActive == false) {
      // prevent loading multiple times the cache when component is
      // several times on tha page
      setTimeout(() => {
        !this.props.fetchingInsureeOfficers && this.props.fetchInsureeOfficers(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
    if (this.isCurrentAdminEnrollmentOfficerActive == true) {
      this.props.fetchContextualEnrollmentOfficer(this.props.modulesManager)

    }
  }
  componentDidUpdate(prevProps) {
    if (this.isCurrentAdminEnrollmentOfficerActive == true &&
      this.props.contextualEnrollmentOfficer !== prevProps.contextualEnrollmentOfficer &&
      this.props.contextualEnrollmentOfficer &&
      this.props.contextualEnrollmentOfficer.length > 0 && this.isEnrollmentAdminOfficer(this.props.user, this.props.contextualEnrollmentOfficer)) {
      this.props.onChange(
        this.props.contextualEnrollmentOfficer[0],
        this.formatSuggestion(this.props.contextualEnrollmentOfficer[0])
      );
    }
  }


  formatSuggestion = (a) => {
    if (!a) return "";

    const fullName = this.renderLastNameFirst
      ? `${a.lastName} ${a.otherName || ""}`.trim()
      : `${a.otherName || ""} ${a.lastName}`.trim();

    return `${a.code} ${fullName}`.trim();
  };

  isEnrollmentAdminOfficer = (user, contextualEnrollmentOfficer) => {
    if (!contextualEnrollmentOfficer || !user) return false;
    if (user.username.trim() === contextualEnrollmentOfficer[0].code.trim()) return true;
    else return false
  }

  isConditionCurrentAdminEnrollmentOfficerActive = () => {
    return this.isCurrentAdminEnrollmentOfficerActive == true
  }

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      value,
      reset,
      insureeOfficers,
      fetchingInsureeOfficers,
      fetchedInsureeOfficers,
      errorInsureeOfficers,
      withLabel = true,
      label,
      readOnly = false,
      required = false,
      withNull = false,
      nullLabel = null,
      contextualEnrollmentOfficer,
      fetchingContextualEnrollmentOfficer,
      fetchedContextualEnrollmentOfficer,
      errorContextualEnrollmentOfficer,
      user
    } = this.props;
    let v = this.isConditionCurrentAdminEnrollmentOfficerActive()
      ? (contextualEnrollmentOfficer ? contextualEnrollmentOfficer.filter((o) => parseInt(decodeId(o.id)) === value) : [])
      : (insureeOfficers ? insureeOfficers.filter((o) => parseInt(decodeId(o.id)) === value) : []);
    v = v.length ? v[0] : null;
    return (
      <Fragment>
        <ProgressOrError progress={fetchingContextualEnrollmentOfficer} error={errorContextualEnrollmentOfficer} />
        {(this.isConditionCurrentAdminEnrollmentOfficerActive() ? fetchedContextualEnrollmentOfficer : fetchedInsureeOfficers) && (
          <AutoSuggestion
            module="insuree"
            items={this.isConditionCurrentAdminEnrollmentOfficerActive() ? contextualEnrollmentOfficer : insureeOfficers}
            label={!!withLabel && (label || formatMessage(intl, "insuree", "InsureeOfficer.label"))}
            getSuggestions={this.insureeOfficers}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
            value={this.isConditionCurrentAdminEnrollmentOfficerActive() && this.isEnrollmentAdminOfficer(user, contextualEnrollmentOfficer) ? contextualEnrollmentOfficer[0] : v}
            reset={reset}
            readOnly={this.isConditionCurrentAdminEnrollmentOfficerActive() && this.isEnrollmentAdminOfficer(user, contextualEnrollmentOfficer) ? true : readOnly}
            required={required}
            selectThreshold={this.selectThreshold}
            withNull={withNull}
            nullLabel={nullLabel || formatMessage(intl, "insuree", "insuree.InsureeOfficer.null")}
          />
        )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  insureeOfficers: state.insuree.insureeOfficers,
  fetchingInsureeOfficers: state.insuree.fetchingInsureeOfficers,
  fetchedInsureeOfficers: state.insuree.fetchedInsureeOfficers,
  errorInsureeOfficers: state.insuree.errorInsureeOfficers,
  contextualEnrollmentOfficer: state.insuree.contextualEnrollmentOfficer,
  fetchingContextualEnrollmentOfficer: state.insuree.fetchingContextualEnrollmentOfficer,
  fetchedContextualEnrollmentOfficer: state.insuree.fetchedContextualEnrollmentOfficer,
  errorContextualEnrollmentOfficer: state.insuree.errorContextualEnrollmentOfficer,
  user: state.core.user
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchInsureeOfficers, fetchContextualEnrollmentOfficer }, dispatch);
};

export default withModulesManager(
  connect(mapStateToProps, mapDispatchToProps)(injectIntl(withTheme(withStyles(styles)(InsureeOfficer)))),
);
