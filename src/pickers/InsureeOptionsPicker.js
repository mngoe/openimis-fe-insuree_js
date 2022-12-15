import React, { Component } from "react";
import { connect } from "react-redux";
import { Box, Grid } from "@material-ui/core";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { formatMessage, AutoSuggestion, TextInput, withModulesManager, ProgressOrError } from "@openimis/fe-core";
import { fetchOptions } from "../actions";
import _debounce from "lodash/debounce";
import _ from "lodash";

class InsureeOptionsPicker extends Component {
  componentDidMount() {
    this.props.fetchQuestions(this.props.modulesManager);
  }

  render() {
    const { intl, classes, fetchingInsureeQuestions, errorInsureeQuestions, insureeQuestions } = this.props;
    console.log(this.props);
    return (
      <Grid item xs={12}>
        
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  insureeOptions: state.insuree.insureeOptions,
  fetchingInsureeOptions: state.insuree.fetchingInsureeOptions,
  fetchedInsureeOptions: state.insuree.fetchedInsureeOptions,
  errorInsureeOptions: state.insuree.errorInsureeOptions,
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchOptions }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(InsureeOptionsPicker)));
