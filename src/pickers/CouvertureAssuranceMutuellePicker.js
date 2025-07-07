import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchCouvertureAssuranceMutuelle } from "../actions";
import _ from "lodash";

class CouvertureAssuranceMutuellePicker extends Component {
  
  componentDidMount() {
    if (!this.props.couvertureAssuranceMutuelleOptions) {
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchCouvertureAssuranceMutuelle(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", "CouvertureAssuranceMutuelle.null");

  formatSuggestion = (i) =>
    !!i ? i.CouvertureAssuranceMutuelle || i.couvertureAssuranceMutuelle || "" : this.nullDisplay;

  onSuggestionSelected = (v) =>
    this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      couvertureAssuranceMutuelleOptions,
      withLabel = true,
      label = "CouvertureAssuranceMutuellePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
    } = this.props;

    console.log("Données brute picker :", couvertureAssuranceMutuelleOptions);

    const options = !!couvertureAssuranceMutuelleOptions
      ? couvertureAssuranceMutuelleOptions.map((v) => ({
          value: v.code,
          label: this.formatSuggestion(v)
        }))
      : [];

    if (withNull) {
      options.unshift({ value: null, label: this.nullDisplay });
    }

    return (
      <SelectInput
        module="insuree"
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder
            ? placeholder || formatMessage(intl, "insuree", "CouvertureAssuranceMutuellePicker.placeholder")
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
  couvertureAssuranceMutuelleOptions: state.insuree.couvertureAssuranceMutuelleOptions,
  fetching: state.insuree.fetchingCouvertureAssuranceMutuelleOptions,
  fetched: state.insuree.fetchedCouvertureAssuranceMutuelleOptions,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ fetchCouvertureAssuranceMutuelle }, dispatch);

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(CouvertureAssuranceMutuellePicker)));
