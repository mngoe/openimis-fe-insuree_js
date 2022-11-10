import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchFoodNumber } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class SalaryPicker extends Component {
  constructor(props) {
    super(props);
    this.selectThreshold = props.modulesManager.getConf("fe-insuree", "FoodPicker.selectThreshold", 10);
  }

  componentDidMount() {
    if (!this.props.foodNumbers) {
      // prevent loading multiple times the cache when component is
      // several times on a page
      setTimeout(() => {
        !this.props.fetching && !this.props.fetched && this.props.fetchFoodNumber(this.props.modulesManager);
      }, Math.floor(Math.random() * 300));
    }
  }

  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `Food.null`);

  formatSuggestion = (i) => `${formatMessage(this.props.intl, "insuree", `Food.${i}`)}`;

  onSuggestionSelected = (v) => this.props.onChange(v, this.formatSuggestion(v));

  render() {
    const {
      intl,
      foodNumbers,
      withLabel = true,
      label,
      withPlaceholder = false,
      placeholder,
      value,
      reset,
      readOnly = false,
      required = false,
      withNull = false,
      nullLabel = null,
    } = this.props;
    return (
      <AutoSuggestion
        module="insuree"
        items={foodNumbers}
        label={!!withLabel && (label || formatMessage(intl, "insuree", "FoodPicker.label"))}
        placeholder={
          !!withPlaceholder ? placeholder || formatMessage(intl, "insuree", "FoodPicker.placehoder") : null
        }
        getSuggestionValue={this.formatSuggestion}
        onSuggestionSelected={this.onSuggestionSelected}
        value={value}
        reset={reset}
        readOnly={readOnly}
        required={required}
        selectThreshold={this.selectThreshold}
        withNull={withNull}
        nullLabel={this.nullDisplay}
      />
    );
  }
}

const mapStateToProps = (state) => ({
  foodNumbers: state.insuree.foodNumbers,
  fetching: state.insuree.fetchingFoodNumbers,
  fetched: state.medical.fetchedFoodNumbers,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchFoodNumber }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(FoodPicker)));
