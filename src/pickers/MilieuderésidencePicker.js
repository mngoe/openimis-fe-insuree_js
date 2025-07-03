import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, withModulesManager, SelectInput } from "@openimis/fe-core";
import { fetchMilieuderésidence } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class MilieuderésidencePicker extends Component {
  componentDidMount() {
    if (!this.props.milieuderésidenceOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMilieuderésidence(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }
  
  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `Milieuderésidence.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `Milieuderésidence.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      milieuderésidenceOptions,
      module = "insuree",
      withLabel = true,
      label = "MilieuderésidencePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    
    let options = !!milieuderésidenceOptions ? 
      milieuderésidenceOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    
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
            ? placeholder || formatMessage(intl, "insuree", "MilieuderésidencePicker.placeholder")
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
  milieuderésidenceOptions: state.insuree.milieuderésidenceOptions,
  fetching: state.insuree.fetchingMilieuderésidenceOptions,
  fetched: state.insuree.fetchedMilieuderésidenceOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    fetchMilieuderésidence,
  }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(MilieuderésidencePicker)));