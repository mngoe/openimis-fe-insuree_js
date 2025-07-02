import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchTypesDhabitation } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class TypesDhabitationPicker extends Component {
  componentDidMount() {
    if (!this.props.typesDhabitationOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchTypesDhabitation(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `TypesDhabitation.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `TypesDhabitation.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      typesDhabitationOptions,
      module = "insuree",
      withLabel = true,
      label = "TypesDhabitationPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    let options = !!typesDhabitationOptions ? typesDhabitationOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "TypesDhabitationPicker.placehoder") : null
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
  typesDhabitationOptions: state.insuree.typesDhabitationOptions,
  fetching: state.insuree.fetchingTypesDhabitationOptions,
  fetched: state.insuree.fetchedTypesDhabitationOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchTypesDhabitation }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(TypesDhabitationPicker)));