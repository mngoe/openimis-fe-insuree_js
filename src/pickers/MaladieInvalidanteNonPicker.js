import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchMaladieInvalidanteNon } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class MaladieInvalidanteNonPicker extends Component {
  componentDidMount() {
    if (!this.props.maladieInvalidanteNonOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchMaladieInvalidanteNon(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      maladieInvalidanteNonOptions,
      module = "insuree",
      withLabel = true,
      label = "MaladieInvalidanteNonPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    
    let options = !!maladieInvalidanteNonOptions ? 
      maladieInvalidanteNonOptions.map((v) => ({ value: v.code, label: v.MaladieInvalidanteNon })) : [];
    
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "MaladieInvalidanteNonPicker.placeholder") : null
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
  maladieInvalidanteNonOptions: state.insuree.maladieInvalidanteNonOptions,
  fetching: state.insuree.fetchingMaladieInvalidanteNonOptions,
  fetched: state.insuree.fetchedMaladieInvalidanteNonOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchMaladieInvalidanteNon }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(MaladieInvalidanteNonPicker)));
