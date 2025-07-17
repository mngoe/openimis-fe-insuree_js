import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchNoDisability } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class NoDisabilityPicker extends Component {
  componentDidMount() {
    if (!this.props.noDisability) {
      // Prevent multiple loads if several components are present on the page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchNoDisability(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      noDisability,
      module = "insuree",
      withLabel = true,
      label = "NoDisabilityPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;

    let options = !!noDisability
      ? noDisability.map((v) => ({
          value: v.code,
          label: v.NoDisability,
          code: v.code,
          NoDisability: v.NoDisability,
          altLanguage: v.altLanguage
        }))
      : [];

    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "NoDisabilityPicker.placeholder")
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
  noDisability: state.insuree.noDisability,
  fetching: state.insuree.fetchingNoDisability,
  fetched: state.insuree.fetchedNoDisability,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    { fetchNoDisability },
    dispatch
  );
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(NoDisabilityPicker)));
