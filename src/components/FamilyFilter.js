import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import _debounce from "lodash/debounce";

import { Button, Checkbox, Chip, FormControlLabel, Grid, Typography } from "@material-ui/core";
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
import { DEFAULT, FAMILY_TYPE_POLYGAMY_CODE } from "../constants";

const styles = (theme) => ({
  dialogTitle: theme.dialog.title,
  dialogContent: theme.dialog.content,
  form: {
    width: "100%",
    boxSizing: "border-box",
    padding: 0,
  },
  item: {
    padding: theme.spacing(1),
  },
  paperDivider: theme.paper.divider,
  section: {
    marginTop: theme.spacing(2),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: ".08em",
    textTransform: "uppercase",
    color: theme.palette.primary.main,
    whiteSpace: "nowrap",
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(0, 74, 124, .18)",
  },
  advancedToggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    paddingTop: theme.spacing(1.5),
    borderTop: "1px solid rgba(0, 74, 124, .14)",
  },
  advancedButton: {
    textTransform: "none",
    border: "1px dashed rgba(0, 74, 124, .35)",
    borderRadius: 4,
    padding: theme.spacing(0.5, 1),
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
  advancedBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0, 74, 124, .10)",
    fontSize: 11,
    fontWeight: 700,
    marginLeft: theme.spacing(0.75),
    padding: "0 6px",
  },
  advancedPanel: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1.5, 2, 2),
    backgroundColor: "rgba(255, 255, 255, .42)",
    borderTop: "1px solid rgba(0, 74, 124, .14)",
  },
  advancedHint: {
    fontSize: 12,
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(1),
  },
});

class FamilyFilter extends Component {
  state = {
    advancedOpen: false,
  };

  constructor(props) {
    super(props);
    this.filterFamiliesOnMembers = props.modulesManager.getConf("fe-insuree", "filterFamiliesOnMembers", true);
    this.renderLastNameFirst = props.modulesManager.getConf(
      "fe-insuree",
      "renderLastNameFirst",
      DEFAULT.RENDER_LAST_NAME_FIRST,
    );
  }

  debouncedOnChangeFilters = _debounce(
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

  renderLastNameField = (anchor, classes) => (
    <ControlledField
      module="insuree"
      id={`FamilyFilter.${anchor}.lastName`}
      field={
        <Grid item xs={12} sm={6} md={3} className={classes.item}>
          <TextInput
            module="insuree"
            label={`Family.${anchor}.lastName`}
            name={`${anchor}_lastName`}
            value={this._filterTextFieldValue(`${anchor}.lastName`)}
            onChange={(v) =>
              this.debouncedOnChangeFilters([
                {
                  id: `${anchor}.lastName`,
                  value: v,
                  filter: !!v ? `${anchor}_LastName_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
      }
    />
  );

  renderGivenNameField = (anchor, classes) => (
    <ControlledField
      module="insuree"
      id={`FamilyFilter.${anchor}.givenName`}
      field={
        <Grid item xs={12} sm={6} md={3} className={classes.item}>
          <TextInput
            module="insuree"
            label={`Family.${anchor}.otherNames`}
            name={`${anchor}_givenName`}
            value={this._filterTextFieldValue(`${anchor}.givenName`)}
            onChange={(v) =>
              this.debouncedOnChangeFilters([
                {
                  id: `${anchor}.givenName`,
                  value: v,
                  filter: !!v ? `${anchor}_OtherNames_Icontains: "${v}"` : null,
                },
              ])
            }
          />
        </Grid>
      }
    />
  );

  personFilter = (anchor, mode = "primary") => {
    const { classes, onChangeFilters } = this.props;
    const includeChfId = mode !== "advanced";
    const includeLastName = mode !== "advanced";
    const includeGivenName = mode !== "primary";
    const includePhone = mode !== "advanced";
    const includeGender = mode !== "primary";
    const includeDob = mode !== "primary";
    const dobFromLabel = anchor === "headInsuree" ? "Family.headInsuree.dobFromShort" : "Family.members.dobFromShort";
    const dobToLabel = anchor === "headInsuree" ? "Family.headInsuree.dobToShort" : "Family.members.dobToShort";

    return (
      <Fragment>
        {includeChfId && (
          <ControlledField
            module="insuree"
            id={`FamilyFilter.${anchor}.chfId`}
            field={
              <Grid item xs={12} sm={6} md={3} className={classes.item}>
                <TextInput
                  module="insuree"
                  label={`Family.${anchor}.chfId`}
                  name={`${anchor}_chfId`}
                  value={this._filterTextFieldValue(`${anchor}.chfId`)}
                  onChange={(v) =>
                    this.debouncedOnChangeFilters([
                      {
                        id: `${anchor}.chfId`,
                        value: v,
                        filter: !!v ? `${anchor}_ChfId_Istartswith: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        )}
        {this.renderLastNameFirst ? (
          <>
            {includeLastName && this.renderLastNameField(anchor, classes)}
            {includeGivenName && this.renderGivenNameField(anchor, classes)}
          </>
        ) : (
          <>
            {includeGivenName && this.renderGivenNameField(anchor, classes)}
            {includeLastName && this.renderLastNameField(anchor, classes)}
          </>
        )}
        {includePhone && (
          <ControlledField
            module="insuree"
            id={`FamilyFilter.${anchor}.phone`}
            field={
              <Grid item xs={12} sm={6} md={3} className={classes.item}>
                <TextInput
                  module="insuree"
                  label={`Family.${anchor}.phone`}
                  name={`${anchor}_phone`}
                  value={this._filterTextFieldValue(`${anchor}.phone`)}
                  onChange={(v) =>
                    this.debouncedOnChangeFilters([
                      {
                        id: `${anchor}.phone`,
                        value: v,
                        filter: !!v ? `${anchor}_Phone_Icontains: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        )}
        {includeGender && (
          <ControlledField
            module="insuree"
            id={`InsureeFilter.${anchor}.gender`}
            field={
              <Grid item xs={12} sm={6} md={3} className={classes.item}>
                <PublishedComponent
                  pubRef="insuree.InsureeGenderPicker"
                  withNull={true}
                  label={`Family.${anchor}.gender`}
                  value={this._filterValue(`${anchor}.gender`)}
                  onChange={(v) =>
                    onChangeFilters([
                      {
                        id: `${anchor}.gender`,
                        value: v,
                        filter: !!v ? `${anchor}_Gender_Code: "${v}"` : null,
                      },
                    ])
                  }
                />
              </Grid>
            }
          />
        )}
        {includeDob && (
          <ControlledField
            module="insuree"
            id={`FamilyFilter.${anchor}.dob`}
            field={
              <Grid item xs={12} sm={6} md={6}>
                <Grid container>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue(`${anchor}.dobFrom`)}
                      module="insuree"
                      label={dobFromLabel}
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: `${anchor}.dobFrom`,
                            value: d,
                            filter: !!d ? `${anchor}_Dob_Gte: "${d}"` : null,
                          },
                        ])
                      }
                    />
                  </Grid>
                  <Grid item xs={6} className={classes.item}>
                    <PublishedComponent
                      pubRef="core.DatePicker"
                      value={this._filterValue(`${anchor}.dobTo`)}
                      module="insuree"
                      label={dobToLabel}
                      onChange={(d) =>
                        onChangeFilters([
                          {
                            id: `${anchor}.dobTo`,
                            value: d,
                            filter: !!d ? `${anchor}_Dob_Lte: "${d}"` : null,
                          },
                        ])
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            }
          />
        )}
      </Fragment>
    );
  };

  onChangeAdditionalFilters = (module, fltrs) => {
    const { onChangeFilters } = this.props;

    let filters = { ...this.state.additionalFilters };
    if (!("additionalFilters" in filters)) {
      filters.additionalFilters = {};
    }

    fltrs.forEach((filter) => {
      if (filter.value === null && module in filters.additionalFilters) {
        delete filters.additionalFilters[module][filter.id];
      } else {
        if (!(module in filters.additionalFilters)) {
          filters.additionalFilters[module] = {};
        }
        filters.additionalFilters[module][filter.id] = filter;
      }
    });
    let filterContent = !!JSON.stringify(filters.additionalFilters) ? JSON.stringify(filters.additionalFilters) : "{}";
    filterContent = filterContent.replaceAll('"', '\\"');

    onChangeFilters([
      {
        id: "additionalFilter",
        value: filters.additionalFilters,
        filter: `additionalFilter: "${filterContent}"`,
      },
    ]);
  };

  familyHeadFilter = (mode = "primary") => this.personFilter("headInsuree", mode);
  familyMemberFilter = () => this.personFilter("members", "member");

  _clearFilter = (id) => {
    if (id === "headInsuree.dobRange") {
      this.props.onChangeFilters([
        { id: "headInsuree.dobFrom", value: null, filter: null },
        { id: "headInsuree.dobTo", value: null, filter: null },
      ]);
      return;
    }
    if (id === "members.dobRange") {
      this.props.onChangeFilters([
        { id: "members.dobFrom", value: null, filter: null },
        { id: "members.dobTo", value: null, filter: null },
      ]);
      return;
    }
    if (id === "familyType") {
      this.props.onChangeFilters([
        { id: "familyType", value: null, filter: null },
        { id: "isSubfamily", value: null, filter: null },
      ]);
      return;
    }
    this.props.onChangeFilters([{ id, value: null, filter: null }]);
  };

  _clearAll = () => {
    const ids = [
      "headInsuree.chfId", "headInsuree.lastName", "headInsuree.givenName", "headInsuree.phone", "headInsuree.gender",
      "headInsuree.dobFrom", "headInsuree.dobTo",
      "members.chfId", "members.lastName", "members.givenName", "members.phone", "members.gender",
      "members.dobFrom", "members.dobTo",
      "status", "poverty", "confirmationNo", "familyType", "isSubfamily", "showHistory",
    ];
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
    add("headInsuree.chfId", "Family.headInsuree.chfId", this._filterTextFieldValue("headInsuree.chfId"));
    add("headInsuree.lastName", "Family.headInsuree.lastName", this._filterTextFieldValue("headInsuree.lastName"));
    add("headInsuree.givenName", "Family.headInsuree.otherNames", this._filterTextFieldValue("headInsuree.givenName"));
    add("headInsuree.phone", "Family.headInsuree.phone", this._filterTextFieldValue("headInsuree.phone"));
    add("members.chfId", "Family.members.chfId", this._filterTextFieldValue("members.chfId"));
    add("members.lastName", "Family.members.lastName", this._filterTextFieldValue("members.lastName"));
    add("members.givenName", "Family.members.otherNames", this._filterTextFieldValue("members.givenName"));
    add("members.phone", "Family.members.phone", this._filterTextFieldValue("members.phone"));
    const status = this._filterValue("status");
    if (status) {
      add("status", "affiliationStatus", status, formatMessage(intl, "insuree", `affiliationStatus.${status}`));
    }
    add("confirmationNo", "Family.confirmationNo", this._filterTextFieldValue("confirmationNo"));
    const headFrom = this._filterValue("headInsuree.dobFrom");
    const headTo = this._filterValue("headInsuree.dobTo");
    if (headFrom || headTo) {
      add("headInsuree.dobRange", "Family.headInsuree.dobFromShort", `${headFrom || "…"} → ${headTo || "…"}`);
    }
    const memberFrom = this._filterValue("members.dobFrom");
    const memberTo = this._filterValue("members.dobTo");
    if (memberFrom || memberTo) {
      add("members.dobRange", "Family.members.dobFromShort", `${memberFrom || "…"} → ${memberTo || "…"}`);
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

  _toggleAdvanced = () => {
    this.setState((state) => ({ advancedOpen: !state.advancedOpen }));
  };

  _renderSection = (titleKey, children) => {
    const { classes, intl } = this.props;
    return (
      <div className={classes.section}>
        <div className={classes.sectionHeader}>
          <Typography className={classes.sectionTitle}>{formatMessage(intl, "insuree", titleKey)}</Typography>
          <span className={classes.sectionLine} />
        </div>
        <Grid container spacing={2}>
          {children}
        </Grid>
      </div>
    );
  };

  render() {
    const { intl, classes, filters, onChangeFilters, filterPaneContributionsKey } = this.props;
    const { advancedOpen } = this.state;
    const familyType = this._filterValue("familyType");
    const showSubfamily = !!familyType && familyType != FAMILY_TYPE_POLYGAMY_CODE;
    const advancedCount =
      5 +
      (this.filterFamiliesOnMembers ? 7 : 0) +
      1 +
      1 +
      1 +
      (showSubfamily ? 1 : 0) +
      1 +
      (!!filterPaneContributionsKey ? 1 : 0);

    return (
      <Grid container className={classes.form}>
        <ControlledField
          module="insuree"
          id="FamilyFilter.location"
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
        />
        {this.familyHeadFilter("primary")}
        <ControlledField
          module="insuree"
          id="FamilyFilter.affiliationStatus"
          field={
            <Grid item xs={12} sm={6} md={4} className={classes.item}>
              <PublishedComponent
                pubRef="insuree.InsureeAffiliationStatusPicker"
                withNull={true}
                value={this._filterValue("status")}
                onChange={this._onChangeStatus}
              />
            </Grid>
          }
        />

        <ControlledField
          module="insuree"
          id="FamilyFilter.poverty"
          field={
            <Grid item xs={12} sm={6} md={4} className={classes.item}>
              <PublishedComponent
                pubRef="insuree.FamilyPovertyStatusPicker"
                value={this._filterValue("poverty")}
                onChange={(v) =>
                  onChangeFilters([
                    {
                      id: "poverty",
                      value: v,
                      filter: v === null ? null : `nullAsFalsePoverty: ${v}`,
                    },
                  ])
                }
              />
            </Grid>
          }
        />

        <div className={classes.advancedToggleRow}>
          <Button
            className={classes.advancedButton}
            onClick={this._toggleAdvanced}
            startIcon={<FilterListIcon />}
            endIcon={advancedOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          >
            {formatMessage(intl, "insuree", advancedOpen ? "FamilyFilter.hideAdvanced" : "FamilyFilter.showAdvanced")}
            <span className={classes.advancedBadge}>{advancedCount}</span>
          </Button>
        </div>

        {advancedOpen && (
          <div className={classes.advancedPanel}>
            <Typography className={classes.advancedHint}>
              {formatMessage(intl, "insuree", "FamilyFilter.advancedHint")}
            </Typography>

            {this._renderSection(
              "FamilyFilter.identification",
              <Fragment>
                {this.familyHeadFilter("advanced")}
                {this.filterFamiliesOnMembers && this.familyMemberFilter()}
                <ControlledField
                  module="insuree"
                  id="FamilyFilter.confirmationNo"
                  field={
                    <Grid item xs={12} sm={6} md={3} className={classes.item}>
                      <TextInput
                        module="insuree"
                        label="Family.confirmationNo"
                        name="confirmationNo"
                        value={this._filterTextFieldValue("confirmationNo")}
                        onChange={(v) =>
                          this.debouncedOnChangeFilters([
                            {
                              id: "confirmationNo",
                              value: v,
                              filter: `confirmationNo_Istartswith: "${v}"`,
                            },
                          ])
                        }
                      />
                    </Grid>
                  }
                />
                <ControlledField
                  module="policy"
                  id="PolicyFilter.officer"
                  field={
                    <Grid item xs={12} sm={6} md={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="policy.PolicyOfficerPicker"
                        withNull={true}
                        value={this._filterValue("officer")}
                        onChange={(v) =>
                          onChangeFilters([
                            {
                              id: "officer",
                              value: v,
                              filter: v === null ? null : `officer: "${v.uuid}"`,
                            },
                          ])
                        }
                      />
                    </Grid>
                  }
                />
              </Fragment>,
            )}

            {this._renderSection(
              "FamilyFilter.options",
              <Fragment>
                <ControlledField
                  module="insuree"
                  id="FamilyFilter.familyType"
                  field={
                    <Grid item xs={12} sm={6} md={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="insuree.FamilyTypePicker"
                        value={familyType}
                        isActiveFilterFamilyType={false}
                        onChange={(v) =>
                          onChangeFilters([
                            {
                              id: "familyType",
                              value: v,
                              filter: v === null || v == "" ? null : `familyType: "${v}"`,
                            },
                            {
                              id: "isSubfamily",
                              value: null,
                              filter: null,
                            },
                          ])
                        }
                      />
                    </Grid>
                  }
                />
                {showSubfamily && (
                  <ControlledField
                    module="insuree"
                    id="FamilyFilter.isSubfamily"
                    field={
                      <Grid item xs={12} sm={6} md={3} className={classes.item}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              checked={!!this._filterValue("isSubfamily")}
                              onChange={(event) => this._onChangeCheckbox("isSubfamily", event.target.checked)}
                            />
                          }
                          label={formatMessage(intl, "insuree", "FamilyFilter.isSubfamily")}
                        />
                      </Grid>
                    }
                  />
                )}
                {!!filterPaneContributionsKey && (
                  <Contributions
                    filters={filters}
                    onChangeFilters={this.onChangeAdditionalFilters}
                    contributionKey={filterPaneContributionsKey}
                  />
                )}
                <ControlledField
                  module="insuree"
                  id="FamilyFilter.showHistory"
                  field={
                    <Grid item xs={12} sm={6} md={3} className={classes.item}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="primary"
                            checked={!!this._filterValue("showHistory")}
                            onChange={(event) => this._onChangeCheckbox("showHistory", event.target.checked)}
                          />
                        }
                        label={formatMessage(intl, "insuree", "FamilyFilter.showHistory")}
                      />
                    </Grid>
                  }
                />
              </Fragment>,
            )}
          </div>
        )}
      </Grid>
    );
  }
}

export default withModulesManager(injectIntl(withTheme(withStyles(styles)(FamilyFilter))));
