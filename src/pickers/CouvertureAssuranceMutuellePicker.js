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

  onSuggestionSelected = (v) => this.props.onChange(v);

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
    } = this.props;

    const options = !!couvertureAssuranceMutuelleOptions
      ? couvertureAssuranceMutuelleOptions.map((v) => ({
          value: v.code,
          label: v.CouvertureAssuranceMutuelle,
          code: v.code,
          CouvertureAssuranceMutuelle: v.CouvertureAssuranceMutuelle,
          altLanguage: v.altLanguage
        }))
      : [];

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
        withNull={false} 
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

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(withModulesManager(CouvertureAssuranceMutuellePicker))
);
