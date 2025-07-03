import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchHandicap_Non } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class Handicap_NonPicker extends Component {
  componentDidMount() {
    if (!this.props.handicap_NonOptions) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchHandicap_Non(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `Handicap_Non.null`);

  formatSuggestion = (i) =>
    !!i ? `${formatMessage(this.props.intl, "insuree", `Handicap_Non.${i}`)}` : this.nullDisplay;

  onSuggestionSelected = (v) => {
    this.props.onChange(v, this.formatSuggestion(v));
  };

  render() {
    const {
      intl,
      handicap_NonOptions,
      module = "insuree",
      withLabel = true,
      label = "Handicap_NonPicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;
    
    let options = !!handicap_NonOptions ?
      handicap_NonOptions.map((v) => ({ value: v, label: this.formatSuggestion(v) })) : [];
    
    if (withNull) {
      options.unshift({ value: null, label: this.formatSuggestion(null) });
    }
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "Handicap_NonPicker.placeholder") : null
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
  handicap_NonOptions: state.insuree.handicap_NonOptions,
  fetching: state.insuree.fetchingHandicap_NonOptions,
  fetched: state.insuree.fetchedHandicap_NonOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchHandicap_Non }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(Handicap_NonPicker)));
