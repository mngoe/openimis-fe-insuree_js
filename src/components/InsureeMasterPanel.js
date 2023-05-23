import React, { Component, Fragment } from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Typography, Divider, Checkbox, FormControlLabel } from "@material-ui/core";
import {
  formatMessage,
  withTooltip,
  FormattedMessage,
  PublishedComponent,
  FormPanel,
  TextInput,
  Contributions,
  withModulesManager,
  NumberInput
} from "@openimis/fe-core";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { fetchQuestions, fetchOptions, fetchAnswers } from "../actions";
import InsureeOptionsPicker from "../pickers/InsureeOptionsPicker"

const styles = (theme) => ({
  paper: theme.paper.paper,
  tableTitle: theme.table.title,
  item: theme.paper.item,
  fullHeight: {
    height: "100%",
  },
});

const INSUREE_INSUREE_CONTRIBUTION_KEY = "insuree.Insuree";
const INSUREE_INSUREE_PANELS_CONTRIBUTION_KEY = "insuree.Insuree.panels";

class InsureeMasterPanel extends FormPanel {

  componentDidMount() {
    this.props.fetchOptions(this.props.modulesManager);
    this.props.fetchQuestions(this.props.modulesManager);
    this.props.fetchAnswers(this.props.modulesManager, this.props.edited_id);
  }


  nullDisplay = this.props.nullLabel || formatMessage(this.props.intl, "insuree", `InsureeGender.null`);

  render() {
    const {
      intl,
      classes,
      edited,
      edited_id,
      module = "insuree",
      title = "Insuree.title",
      titleParams = { label: "" },
      readOnly = true,
      actions,
      insureeQuestions,
      insureeAnswers,
      answers = [],
      insureeOptions,
    } = this.props;

    //console.log(insureeAnswers);

    insureeQuestions.forEach(function (question) {
      if (question.questionType == "DROPDOWN") {
        let opt = [];
        var optionLab;
        var optionId;
        var optionMark;
        insureeOptions.forEach(function (option) {
          if (question.id == option.questionId.id) {
            opt.push({ value: option.option, label: option.option, id: option.id, mark: option.optionValue });
          }
          insureeAnswers.forEach(function (ans) {
            if (ans.question.id == question.id && ans.insureeAnswer == option.id) {
              optionLab = option.option;
              optionId = ans.insureeAnswer;
              optionMark = option.optionValue;
            }
          })
        });
        answers.push({ questionId: question.id, optionId: optionId, options: opt, optionLabel: optionLab, mark: optionMark });
      } else if (question.questionType == "TEXT") {
        var answer;
        insureeAnswers.forEach(function (ans) {
          if (ans.question.id == question.id) {
            answer = ans.insureeAnswer;
          }
        })
        answers.push({ questionId: question.id, answer: answer, mark: answer })
      } else if (question.questionType == "CHECKBOX") {
        var value = false;
        var mark = 1;
        insureeAnswers.forEach(function (ans) {
          if (ans.question.id == question.id) {
            if (ans.insureeAnswer == 1) {
              value = true;
              mark = 5
            } else {
              value = false;
              mark = 1
            }
          }
        })
        answers.push({ questionId: question.id, value: value, mark: mark })
      }
    });

    return (
      <Grid container>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <Grid container className={classes.tableTitle}>
              <Grid item xs={3} container alignItems="center" className={classes.item}>
                <Typography variant="h5">
                  <FormattedMessage module="insuree" id={title} values={titleParams} />
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Grid container justify="flex-end">
                  {!!edited &&
                    !!edited.family &&
                    !!edited.family.headInsuree &&
                    edited.family.headInsuree.id !== edited.id && (
                      <Grid item xs={3}>
                        <PublishedComponent
                          pubRef="insuree.RelationPicker"
                          withNull={true}
                          nullLabel={formatMessage(this.props.intl, "insuree", `Relation.none`)}
                          readOnly={readOnly}
                          value={!!edited && !!edited.relationship ? edited.relationship.id : ""}
                          onChange={(v) => this.updateAttribute("relationship", { id: v })}
                        />
                      </Grid>
                    )}
                  {!!actions &&
                    actions.map((a, idx) => {
                      return (
                        <Grid item key={`form-action-${idx}`} className={classes.paperHeaderAction}>
                          {withTooltip(a.button, a.tooltip)}
                        </Grid>
                      );
                    })}
                </Grid>
              </Grid>
            </Grid>
            <Divider />
            <Grid container className={classes.item}>
              <Grid item xs={4} className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.InsureeNumberInput"
                  module="insuree"
                  label="Insuree.chfId"
                  required={true}
                  readOnly={readOnly}
                  value={edited?.chfId}
                  new_insuree={!edited?.id}
                  onChange={(v) => this.updateAttribute("chfId", v)}
                />
              </Grid>
              <Grid item xs={4} className={classes.item}>
                <TextInput
                  module="insuree"
                  label="Insuree.lastName"
                  required={true}
                  readOnly={readOnly}
                  value={!!edited && !!edited.lastName ? edited.lastName : ""}
                  onChange={(v) => this.updateAttribute("lastName", v)}
                />
              </Grid>
              <Grid item xs={4} className={classes.item}>
                <TextInput
                  module="insuree"
                  label="Insuree.otherNames"
                  required={true}
                  readOnly={readOnly}
                  value={!!edited && !!edited.otherNames ? edited.otherNames : ""}
                  onChange={(v) => this.updateAttribute("otherNames", v)}
                />
              </Grid>
              <Grid item xs={8}>
                <Grid container>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={!!edited ? edited.dob : null}
                      module="insuree"
                      label="Insuree.dob"
                      readOnly={readOnly}
                      required={true}
                      onChange={(v) => this.updateAttribute("dob", v)}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.InsureeGenderPicker"
                      value={!!edited && !!edited.gender ? edited.gender.code : ""}
                      module="insuree"
                      readOnly={readOnly}
                      withNull={true}
                      required={true}
                      onChange={(v) => this.updateAttribute("gender", { code: v })}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.InsureeMaritalStatusPicker"
                      value={!!edited && !!edited.marital ? edited.marital : ""}
                      module="insuree"
                      readOnly={readOnly}
                      withNull={true}
                      nullLabel="InsureeMaritalStatus.N"
                      onChange={(v) => this.updateAttribute("marital", v)}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={!!edited && !!edited.cardIssued}
                          disabled={readOnly}
                          onChange={(v) => this.updateAttribute("cardIssued", !edited || !edited.cardIssued)}
                        />
                      }
                      label={formatMessage(intl, "insuree", "Insuree.cardIssued")}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <PublishedComponent
                      pubRef="insuree.InsureeAddress"
                      value={edited}
                      module="insuree"
                      readOnly={readOnly}
                      onChangeLocation={(v) => this.updateAttribute("currentVillage", v)}
                      onChangeAddress={(v) => this.updateAttribute("currentAddress", v)}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      module="insuree"
                      label="Insuree.phone"
                      readOnly={readOnly}
                      value={!!edited && !!edited.phone ? edited.phone : ""}
                      onChange={(v) => this.updateAttribute("phone", v)}
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <TextInput
                      module="insuree"
                      label="Insuree.email"
                      readOnly={readOnly}
                      value={!!edited && !!edited.email ? edited.email : ""}
                      onChange={(v) => this.updateAttribute("email", v)}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.ProfessionPicker"
                      module="insuree"
                      value={!!edited && !!edited.profession ? edited.profession.id : null}
                      readOnly={readOnly}
                      withNull={true}
                      nullLabel={formatMessage(intl, "insuree", "Profession.none")}
                      onChange={(v) => this.updateAttribute("profession", { id: v })}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.EducationPicker"
                      module="insuree"
                      value={!!edited && !!edited.education ? edited.education.id : ""}
                      readOnly={readOnly}
                      withNull={true}
                      nullLabel={formatMessage(intl, "insuree", "insuree.Education.none")}
                      onChange={(v) => this.updateAttribute("education", { id: v })}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.IdentificationTypePicker"
                      module="insuree"
                      value={!!edited && !!edited.typeOfId ? edited.typeOfId.code : null}
                      readOnly={readOnly}
                      withNull={true}
                      nullLabel={formatMessage(intl, "insuree", "IdentificationType.none")}
                      onChange={(v) => this.updateAttribute("typeOfId", { code: v })}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <TextInput
                      module="insuree"
                      label="Insuree.passport"
                      readOnly={readOnly}
                      value={!!edited && !!edited.passport ? edited.passport : ""}
                      onChange={(v) => this.updateAttribute("passport", !!v ? v : null)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4} className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.Avatar"
                  photo={!!edited ? edited.photo : null}
                  readOnly={readOnly}
                  withMeta={true}
                  onChange={(v) => this.updateAttribute("photo", !!v ? v : null)}
                />
              </Grid>
              {!!insureeQuestions && insureeQuestions.length > 0 && (
                <Grid container className={classes.item}>
                  {insureeQuestions.map((e, edx) => {
                    return (
                      <Grid item xs={6} className={classes.item}>
                        <InsureeOptionsPicker
                          module="insuree"
                          label={e.question}
                          insureeId={edited_id}
                          required={true}
                          readOnly={false}
                          position={edx}
                          edited={edited}
                          insureeAnswers={answers}
                          insureeQuestions={insureeQuestions}
                          updateAttribute={this.updateAttribute}
                          onEditedChanged={this.props.onEditedChanged}
                        />
                      </Grid>
                    )
                  })}
                </Grid>
              )}
              {!!edited && !!edited.score && (
                <Grid item xs={3} className={classes.item}>
                  <NumberInput
                    label="Score"
                    readOnly={true}
                    value={edited[`score`]}
                  />
                </Grid>
              )
              }
              <Contributions
                {...this.props}
                updateAttribute={this.updateAttribute}
                contributionKey={INSUREE_INSUREE_CONTRIBUTION_KEY}
              />
            </Grid>
          </Paper>
          <Contributions
            {...this.props}
            updateAttribute={this.updateAttribute}
            contributionKey={INSUREE_INSUREE_PANELS_CONTRIBUTION_KEY}
          />
        </Grid>
      </Grid>
    );
  }
}

const mapStateToProps = state => ({
  insureeQuestions: state.insuree.insureeQuestions,
  fetchingInsureeQuestions: state.insuree.fetchingInsureeQuestions,
  fetchedInsureeQuestions: state.insuree.fetchedInsureeQuestions,
  errorInsureeQuestions: state.insuree.errorInsureeQuestions,
  insureeOptions: state.insuree.insureeOptions,
  fetchingInsureeOptions: state.insuree.fetchingInsureeOptions,
  fetchedInsureeOptions: state.insuree.fetchedInsureeOptions,
  errorInsureeOptions: state.insuree.errorInsureeOptions,
  insureeAnswers: state.insuree.insureeAnswers,
  fetchingInsureeAnswers: state.insuree.fetchingInsureeAnswers,
  fetchedInsureeAnswers: state.insuree.fetchedInsureeAnswers,
  errorInsureeAnswers: state.insuree.errorInsureeAnswers
});

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({ fetchQuestions, fetchOptions, fetchAnswers }, dispatch);
};


export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(withModulesManager(withTheme(withStyles(styles)(InsureeMasterPanel)))));
