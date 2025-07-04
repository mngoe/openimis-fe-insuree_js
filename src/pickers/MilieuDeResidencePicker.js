import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, withModulesManager, SelectInput } from "@openimis/fe-core";
import { fetchMilieuderesidence } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class MilieuDeResidencePicker extends Component {
  componentDidMount() {
    if (!this.props.milieuDeResidenceOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMilieuderesidence(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }
  
  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `MilieuDeResidence.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `MilieuDeResidence.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      milieuDeResidenceOptions,
      module = "insuree",
      withLabel = true,
      label = "MilieuDeResidencePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    
    let options = !!milieuDeResidenceOptions ? 
      milieuDeResidenceOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "MilieuDeResidencePicker.placeholder")
            : null
        }
        onChange={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        withNull={withNull}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  milieuDeResidenceOptions: state.insuree.milieuDeResidenceOptions,
  fetching: state.insuree.fetchingMilieuderesidenceOptions,
  fetched: state.insuree.fetchedMilieuderesidenceOptions,
  error: state.insuree.errorMilieuderesidenceOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchMilieuderesidence,
  }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(MilieuDeResidencePicker)));