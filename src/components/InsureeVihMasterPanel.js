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
} from "@openimis/fe-core";
import { RIGHT_VIH , INSUREE_ACTIVE_STRING} from "../constants";

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

class InsureeVihMasterPanel extends FormPanel {
  render() {
    const {
      intl,
      classes,
      edited,
      rights,
      title = "Insuree.title",
      titleParams = { label: "" },
      readOnly = true,
      modulesManager,
      actions,
    } = this.props;
    const isInsureeStatusRequired = modulesManager.getConf("fe-insuree", "insureeForm.isInsureeStatusRequired", false);
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
                <TextInput
                  module="insuree"
                  label="Insuree.chfId"
                  required={true}
                  readOnly={readOnly}
                  value={edited?.chfId}
                  new_insuree={!edited?.id}
                  onChange={(v) => this.updateAttribute("chfId", v)}
                />
              </Grid>
              <Grid item xs={12}>
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
                      pubRef="insuree.InsureeStatusPicker"
                      label="Insuree.status"
                      value={edited?.status}
                      module="insuree"
                      readOnly={readOnly}
                      onChange={(v) => {
                        this.updateAttributes({ "status": v, "statusReason": null });
                      }}
                      required={isInsureeStatusRequired}
                    />
                  </Grid>
                  {!!edited?.status && edited?.status !== INSUREE_ACTIVE_STRING && (
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="core.DatePicker"
                        label="Insuree.statusDate"
                        value={edited?.statusDate}
                        module="insuree"
                        readOnly={readOnly}
                        required={true}
                        onChange={(v) => this.updateAttribute("statusDate", v)}
                      />
                    </Grid>
                  )}
                  {!!edited?.status && edited?.status !== INSUREE_ACTIVE_STRING && (
                    <Grid item xs={3} className={classes.item}>
                      <PublishedComponent
                        pubRef="insuree.InsureeStatusReasonPicker"
                        label="Insuree.statusReason"
                        value={edited?.statusReason}
                        module="insuree"
                        readOnly={readOnly}
                        withNull={false}
                        statusType={edited.status}
                        required={true}
                        onChange={(v) => this.updateAttribute("statusReason", v)}
                      />
                    </Grid>
                  )}
                </Grid>
              </Grid>
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

export default withModulesManager(withTheme(withStyles(styles)(InsureeVihMasterPanel)));
