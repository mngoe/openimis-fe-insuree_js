import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchMutualInsuranceCoverage } from "../actions";
import _ from "lodash";

class MutualInsuranceCoveragePicker extends Component {
  componentDidMount() {
    if (!this.props.mutualInsuranceCoverage) {
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMutualInsuranceCoverage(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      mutualInsuranceCoverage,
      withLabel = true,
      label = "MutualInsuranceCoveragePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;

    const options = !!mutualInsuranceCoverage
      ? mutualInsuranceCoverage.map((v) => ({
          value: v.code,
          label: v.MutualInsuranceCoverage,
          code: v.code,
          MutualInsuranceCoverage: v.MutualInsuranceCoverage,
          altLanguage: v.altLanguage
        }))
      : [];

    return (
      <SelectInput
        module="insuree"
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "MutualInsuranceCoveragePicker.placeholder")
            : null
        }
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  mutualInsuranceCoverage: state.insuree.mutualInsuranceCoverage,
  fetching: state.insuree.fetchingMutualInsuranceCoverage,
  fetched: state.insuree.fetchedMutualInsuranceCoverage,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchMutualInsuranceCoverage }, dispatch);

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(withModulesManager(MutualInsuranceCoveragePicker))
);
