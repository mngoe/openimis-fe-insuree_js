import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchDisplacement } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class SalaryPicker extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-insuree", "DisplacementConditionPicker.selectThreshold", 10);
  }

  componentDidMount() {
    if (!this.props.displacementCondition) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchDisplacement(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `Salary.null`);

  formatSuggestion = (i) => `${formatMessage(this.props.intl, "insuree", `Salary.${i}`)}`;

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      DisplacementConditions,
      withLabel = true,
      label,
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
      nullLabel = null,
    } = this.props;
    return (
      <AutoSuggestion
        module="insuree"
        items={DisplacementConditions}
        label={!!withLabel && (label || formatMessage(intl, "insuree", "DisplacementConditionPicker.label"))}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "DisplacementConditionPicker.placehoder") : null
        }
        getSuggestionValue={this.formatSuggestion}
        onSuggestionSelected={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  DisplacementConditions: state.insuree.DisplacementConditions,
  fetching: state.insuree.fetchingDisplacementConditions,
  fetched: state.medical.fetchedDisplacementConditions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchDisplacementConditions }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(SalaryPicker)));
