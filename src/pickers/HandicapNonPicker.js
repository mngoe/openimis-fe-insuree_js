import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchHandicapNon } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class HandicapNonPicker extends Component {
  componentDidMount() {
    if (!this.props.handicapNonOptions) {
      // Prevent multiple loads if several components are present on the page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchHandicapNon(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      handicapNonOptions,
      module = "insuree",
      withLabel = true,
      label = "HandicapNonPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;

    let options = !!handicapNonOptions
      ? handicapNonOptions.map((v) => ({
          value: v.code,
          label: v.HandicapNon,
        }))
      : [];

    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "HandicapNonPicker.placeholder")
            : null
        }
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={false}
      />
    );
  }
}


const mapStateToProps = (state) => ({
  handicapNonOptions: state.insuree.handicapNonOptions,
  fetching: state.insuree.fetchingHandicapNonOptions,
  fetched: state.insuree.fetchedHandicapNonOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { fetchHandicapNon },
    dispatch
  );
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(HandicapNonPicker)));
