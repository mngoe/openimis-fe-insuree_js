import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchMaladieinvalidante_Non } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class Maladieinvalidante_NonPicker extends Component {
  componentDidMount() {
    if (!this.props.maladieinvalidante_NonOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMaladieinvalidante_Non(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `Maladieinvalidante_Non.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `Maladieinvalidante_Non.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      maladieinvalidante_NonOptions,
      module = "insuree",
      withLabel = true,
      label = "Maladieinvalidante_NonPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    
    let options = !!maladieinvalidante_NonOptions ?
      maladieinvalidante_NonOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          withPlaceholder ? placeholder || formatMessage(intl, "insuree", "Maladieinvalidante_NonPicker.placeholder") : null
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
  maladieinvalidante_NonOptions: state.insuree.maladieinvalidante_NonOptions,
  fetching: state.insuree.fetchingMaladieinvalidante_NonOptions,
  fetched: state.insuree.fetchedMaladieinvalidante_NonOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchMaladieinvalidante_Non }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(Maladieinvalidante_NonPicker)));
