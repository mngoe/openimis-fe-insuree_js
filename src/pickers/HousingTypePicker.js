import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, SelectInput, withModulesManager } from "@openimis/fe-core";
import { fetchHousingType } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class HousingTypePicker extends Component {
  componentDidMount() {
    if (!this.props.housingType) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchHousingType(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  onSuggestionSelected = (v) => this.props.onChange(v);

  render() {
    const {
      intl,
      housingType,
      module = "insuree",
      withLabel = true,
      label = "HousingTypePicker.label",
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = true,
    } = this.props;

    const options = !!housingType ? housingType.map((v) => ({
      value: v.code, 
      label: v.HousingType,
      code: v.code,
      HousingType: v.HousingType,
      altLanguage: v.altLanguage
    })) : [];
    
    return (
      <SelectInput
        module={module}
        options={options}
        label={!!withLabel ? label : null}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "HousingTypePicker.placeholder") : null
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
  housingType: state.insuree.housingType,
  fetching: state.insuree.fetchingHousingType,
  fetched: state.insuree.fetchedHousingType,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchHousingType }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(HousingTypePicker)));
