import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Button, Checkbox, Chip, FormControlLabel, Grid } from "@material-ui/core";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import FilterListIcon from "@material-ui/icons/FilterList";

import {
  withModulesManager,
  formatMessage,
  Contributions,
  PublishedComponent,
  ControlledField,
  TextInput,
} from "@openimis/fe-core";
import {DEFAULT, WITHOUT_STR} from "../constants";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
  advancedRow: {
    width: "100%",
    flexBasis: "100%",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
    paddingTop: theme.spacing(1),
    borderTop: "1px solid #cfe5e4",
  },
  advancedButton: {
    textTransform: "none",
    border: "1px dashed rgba(0, 74, 124, .35)",
    borderRadius: 4,
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  chips: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  chip: {
    backgroundColor: "rgba(55, 212, 204, .22)",
    color: theme.palette.primary.main,
    fontWeight: 500,
    height: 26,
    fontSize: 12,
  },
  clearAll: {
    textTransform: "none",
    fontSize: 12,
    color: theme.palette.primary.main,
    textDecoration: "underline",
    minWidth: "auto",
    padding: theme.spacing(0, 0.5),
  },
});

const INSUREE_FILTER_CONTRIBUTION_KEY = "insuree.Filter";

class InsureeFilter extends Component {
  state = {
    advancedOpen: false,
  };

  constructor(props) {
      super(props);
      this.isWorker = props.modulesManager.getConf("fe-core", "isWorker", DEFAULT.IS_WORKER);
      this.renderLastNameFirst = props.modulesManager.getConf("fe-insuree", "renderLastNameFirst", DEFAULT.RENDER_LAST_NAME_FIRST);
  }

  debouncedOnChangeFilter = _debounce(
    this.props.onChangeFilters,
    this.props.modulesManager.getConf("fe-insuree", "debounceTime", 200),
  );

  _filterValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : null;
  };

  _filterTextFieldValue = (k) => {
    const { filters } = this.props;
    return !!filters && !!filters[k] ? filters[k].value : "";
  };

  _onChangeCheckbox = (key, value) => {
    let filters = [
      {
        id: key,
        value: value,
        filter: `${key}: ${value}`,
      },
    ];
    this.props.onChangeFilters(filters);
  };

  _onChangeStatus = (statusValue) => {
    this.props.onChangeFilters([
      {
        id: "status",
        value: statusValue,
        filter: statusValue ? `affiliationType: "${statusValue}"` : null,
      },
    ]);
  };

  renderLastNameField = () => {
    const { classes } = this.props;
    return (
      <ControlledField
        module="insuree"
        id="InsureeFilter.lastName"
        field={
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="insuree"
              label="Insuree.lastName"
              name="lastName"
              value={this._filterTextFieldValue("lastName")}
              onChange={(v) =>
                this.debouncedOnChangeFilter([
                  {
                    id: "lastName",
                    value: v,
                    filter: `lastName_Icontains: "${v}"`,
                  },
                ])
              }
            />
          </Grid>
        }
      />
    );
  }

  renderGivenNameField = () => {
    const { classes } = this.props;
    return (
      <ControlledField
        module="insuree"
        id="InsureeFilter.givenName"
        field={
          <Grid item xs={3} className={classes.item}>
            <TextInput
              module="insuree"
              label="Insuree.otherNames"
              name="givenName"
              value={this._filterTextFieldValue("givenName")}
              onChange={(v) =>
                this.debouncedOnChangeFilter([
                  {
                    id: "givenName",
                    value: v,
                    filter: `otherNames_Icontains: "${v}"`,
                  },
                ])
              }
            />
          </Grid>
        }
      />
    );
  }

  _clearFilter = (id) => {
    this.props.onChangeFilters([{ id, value: null, filter: null }]);
  };

  _clearAll = () => {
    const ids = ["chfId", "lastName", "givenName", "phone", "status"];
    this.props.onChangeFilters(ids.map((id) => ({ id, value: null, filter: null })));
  };

  _renderChips = () => {
    const { intl, classes } = this.props;
    const chips = [];
    const add = (id, labelKey, value, formattedValue = null) => {
      if (value === null || value === undefined || value === "") return;
      chips.push({
        id,
        label: formatMessage(intl, "insuree", labelKey),
        value: formattedValue ?? value,
      });
    };
    add("chfId", "Insuree.chfId", this._filterTextFieldValue("chfId"));
    add("lastName", "Insuree.lastName", this._filterTextFieldValue("lastName"));
    add("givenName", "Insuree.otherNames", this._filterTextFieldValue("givenName"));
    add("phone", "Insuree.phone", this._filterTextFieldValue("phone"));
    const status = this._filterValue("status");
    if (status) {
      add("status", "insuree.affiliationStatus", status, formatMessage(intl, "insuree", `affiliationStatus.${status}`));
    }
    return (
      <Fragment>
        {chips.map((chip) => (
          <Chip
            key={chip.id}
            size="small"
            className={classes.chip}
            onDelete={() => this._clearFilter(chip.id)}
            label={<span><b>{chip.label}</b> : {chip.value}</span>}
          />
        ))}
        {chips.length > 0 && (
          <Button className={classes.clearAll} onClick={this._clearAll}>
            {formatMessage(intl, "core", "exportColumnsDialog.clearAllButton")}
          </Button>
        )}
      </Fragment>
    );
  };

  render() {
    const { intl, classes, filters, onChangeFilters } = this.props;

    return (
      <Grid container className={classes.form}>
          {!this.isWorker && (<ControlledField
              module="insuree"
              id="InsureeFilter.location"
              field={
                  <Grid item xs={12}>
                      <PublishedComponent
                          pubRef="location.DetailedLocationFilter"
                          withNull={true}
                          filters={filters}
                          onChangeFilters={onChangeFilters}
                          anchor="parentLocation"
                      />
                  </Grid>
              }
          />)}
        <ControlledField
          module="insuree"
          id="InsureeFilter.chfId"
          field={
            <Grid item xs={3} className={classes.item}>
              <TextInput
                module="insuree"
                label="Insuree.chfId"
                name="chfId"
                value={this._filterTextFieldValue("chfId")}
                onChange={(v) =>
                  this.debouncedOnChangeFilter([
                    {
                      id: "chfId",
                      value: v,
                      filter: `chfId_Istartswith: "${v}"`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />
        {this.renderLastNameFirst ? (
          <>
            {this.renderLastNameField()}
            {this.renderGivenNameField()}
          </>
        ) : (
          <>
            {this.renderGivenNameField()}
            {this.renderLastNameField()}
          </>
        )}
          {this.state.advancedOpen && !this.isWorker && (<Grid item xs={3}>
              <Grid container>
                  <ControlledField
                      module="insuree"
                      id="InsureeFilter.gender"
                      field={
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="insuree.InsureeGenderPicker"
                                  withNull={true}
                                  value={this._filterValue("gender")}
                                  onChange={(v) =>
                                      onChangeFilters([
                                          {
                                              id: "gender",
                                              value: v,
                                              filter: !!v ? `gender_Code: "${v}"` : null,
                                          },
                                      ])
                                  }
                              />
                          </Grid>
                      }
                  />
                  <ControlledField
                      module="insuree"
                      id="InsureeFilter.maritalStatus"
                      field={
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="insuree.InsureeMaritalStatusPicker"
                                  value={this._filterValue("maritalStatus")}
                                  onChange={(v) =>
                                      onChangeFilters([
                                          {
                                              id: "maritalStatus",
                                              value: v,
                                              filter: `marital: "${v}"`,
                                          },
                                      ])
                                  }
                              />
                          </Grid>
                      }
                  />
              </Grid>
          </Grid>)}
          {this.state.advancedOpen && !this.isWorker && (<ControlledField
              module="insuree"
              id="InsureeFilter.email"
              field={
                  <Grid item xs={3} className={classes.item}>
                      <TextInput
                          module="insuree"
                          label="Insuree.email"
                          name="email"
                          value={this._filterTextFieldValue("email")}
                          onChange={(v) =>
                              this.debouncedOnChangeFilter([
                                  {
                                      id: "email",
                                      value: v,
                                      filter: `email_Icontains: "${v}"`,
                                  },
                              ])
                          }
                      />
                  </Grid>
              }
          />)}
          {!this.isWorker && (<ControlledField
              module="insuree"
              id="InsureeFilter.phone"
              field={
                  <Grid item xs={3} className={classes.item}>
                      <TextInput
                          module="insuree"
                          label="Insuree.phone"
                          name="phone"
                          value={this._filterTextFieldValue("phone")}
                          onChange={(v) =>
                              this.debouncedOnChangeFilter([
                                  {
                                      id: "phone",
                                      value: v,
                                      filter: `phone_Icontains: "${v}"`,
                                  },
                              ])
                          }
                      />
                  </Grid>
              }
          />)}
          {!this.isWorker && (<ControlledField
            module="insuree"
            id="InsureeFilter.familyStatus"
            field={
                <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                        pubRef="insuree.FamilyStatusPicker"
                        value={this._filterValue("familyStatus")}
                        onChange={(s) =>
                            onChangeFilters([
                                {
                                    id: "familyStatus",
                                    value: s,
                                    filter: `family_Isnull: ${s === WITHOUT_STR}`,
                                },
                            ])
                        }
                    />
                </Grid>
              }
          />)}

          <ControlledField
            module="insuree"
            id="InsureeFilter.affiliationStatus"
            field={
              <Grid item xs={3} className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.InsureeAffiliationStatusPicker"
                  withNull={true}
                  value={this._filterValue("status")}
                  onChange={this._onChangeStatus}
                />
              </Grid>
            }
          />

          <Grid item xs={12} className={classes.advancedRow}>
            <Button
              className={classes.advancedButton}
              onClick={() => this.setState((state) => ({ advancedOpen: !state.advancedOpen }))}
              startIcon={<FilterListIcon />}
              endIcon={this.state.advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            >
              {formatMessage(intl, "core", "advancedFilters")}
            </Button>
          </Grid>
          <Grid item xs={12}>
            <div className={classes.chips}>{this._renderChips()}</div>
          </Grid>
          {this.state.advancedOpen && !this.isWorker && (<ControlledField
              module="insuree"
              id="InsureeFilter.dob"
              field={
                  <Grid item xs={6}>
                      <Grid container>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("dobFrom")}
                                  module="insuree"
                                  label="Insuree.dobFrom"
                                  {...(filters.dobTo ? { maxDate: filters.dobTo.value } : null)}
                                  onChange={(d) =>
                                      onChangeFilters([
                                          {
                                              id: "dobFrom",
                                              value: d,
                                              filter: `dob_Gte: "${d}"`,
                                          },
                                      ])
                                  }
                              />
                          </Grid>
                          <Grid item xs={6} className={classes.item}>
                              <PublishedComponent
                                  pubRef="core.DatePicker"
                                  value={this._filterValue("dobTo")}
                                  module="insuree"
                                  label="Insuree.dobTo"
                                  {...(filters.dobFrom ? { minDate: filters.dobFrom.value } : null)}
                                  onChange={(d) =>
                                      onChangeFilters([
                                          {
                                              id: "dobTo",
                                              value: d,
                                              filter: `dob_Lte: "${d}"`,
                                          },
                                      ])
                                  }
                              />
                          </Grid>
                      </Grid>
                  </Grid>
              }
          />)}
        {this.state.advancedOpen && (<Grid item xs={3}>
          <Grid container>
              {!this.isWorker && (<ControlledField
                  module="insuree"
                  id="InsureeFilter.photoStatus"
                  field={
                      <Grid item xs={6} className={classes.item}>
                          <PublishedComponent
                              pubRef="insuree.PhotoStatusPicker"
                              value={this._filterValue("photoStatus")}
                              onChange={(s) =>
                                  onChangeFilters([
                                      {
                                          id: "photoStatus",
                                          value: s,
                                          filter: `photo_Isnull: ${s === WITHOUT_STR}`,
                                      },
                                  ])
                              }
                          />
                      </Grid>
                  }
              />)}
            <ControlledField
              module="insuree"
              id="InsureeFilter.showHistory"
              field={
                <Grid item xs={6} className={classes.item}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={!!this._filterValue("showHistory")}
                        onChange={(event) => this._onChangeCheckbox("showHistory", event.target.checked)}
                      />
                    }
                    label={formatMessage(intl, "insuree", "InsureeFilter.showHistory")}
                  />
                </Grid>
              }
            />
          </Grid>
        </Grid>)}
        {this.state.advancedOpen && (
        <Contributions
          filters={filters}
          onChangeFilters={onChangeFilters}
          contributionKey={INSUREE_FILTER_CONTRIBUTION_KEY}
        />
        )}
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(InsureeFilter))));
