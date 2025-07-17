import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, withModulesManager, SelectInput } from "@openimis/fe-core";
import { fetchResidenceEnvironment } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class ResidenceEnvironmentPicker extends Component {
  componentDidMount() {
    if (!this.props.residenceEnvironment) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchResidenceEnvironment(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      residenceEnvironment,
      module = "insuree",
      withLabel = true,
      label = "ResidenceEnvironmentPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;
    
    let options = !!residenceEnvironment ? 
      residenceEnvironment.map((v) => ({
        value: v.code, 
        label: v.ResidenceEnvironment,
        code: v.code,
        ResidenceEnvironment: v.ResidenceEnvironment,
        altLanguage: v.altLanguage
      })) : [];
 
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "ResidenceEnvironmentPicker.placeholder")
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
  residenceEnvironment: state.insuree.residenceEnvironment,
  fetching: state.insuree.fetchingResidenceEnvironment,
  fetched: state.insuree.fetchedResidenceEnvironment,
  error: state.insuree.errorResidenceEnvironment,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchResidenceEnvironment,
  }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(ResidenceEnvironmentPicker)));
