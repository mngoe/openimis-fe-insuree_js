import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchNonDisablingDisease } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class NonDisablingDiseasePicker extends Component {
  componentDidMount() {
    if (!this.props.nonDisablingDisease) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchNonDisablingDisease(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      nonDisablingDisease,
      module = "insuree",
      withLabel = true,
      label = "NonDisablingDiseasePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;
    
    console.log(this.props.nonDisablingDisease);

    const options = !!nonDisablingDisease ? 
      nonDisablingDisease.map((v) => ({
        value: v.code, 
        label: v.nonDisablingDisease,
        code: v.code,
        nonDisablingDisease: v.nonDisablingDisease,
        altLanguage: v.altLanguage
      })) : [];
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "NonDisablingDiseasePicker.placeholder") : null
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
  nonDisablingDisease: state.insuree.nonDisablingDisease,
  fetching: state.insuree.fetchingNonDisablingDisease,
  fetched: state.insuree.fetchedNonDisablingDisease,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchNonDisablingDisease }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(NonDisablingDiseasePicker)));
