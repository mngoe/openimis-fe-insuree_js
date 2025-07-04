import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchMaladieInvalidante } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class MaladieInvalidantePicker extends Component {
  componentDidMount() {
    if (!this.props.maladieInvalidanteOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMaladieInvalidante(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `MaladieInvalidante.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `MaladieInvalidante.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      maladieInvalidanteOptions,
      module = "insuree",
      withLabel = true,
      label = "MaladieInvalidantePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    let options = !!maladieInvalidanteOptions ? maladieInvalidanteOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          withPlaceholder ? placeholder || formatMessage(intl, "insuree", "MaladieInvalidantePicker.placeholder") : null
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
  maladieInvalidanteOptions: state.insuree.maladieInvalidanteOptions,
  fetching: state.insuree.fetchingMaladieInvalidanteOptions,
  fetched: state.insuree.fetchedMaladieInvalidanteOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchMaladieInvalidante }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(MaladieInvalidantePicker)));
