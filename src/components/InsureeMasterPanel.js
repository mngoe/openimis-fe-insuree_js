import React from "react";
import { withTheme, withStyles } from "@material-ui/core/styles";
import { Paper, Grid, Typography, Divider, Checkbox, FormControlLabel, InputAdornment } from "@material-ui/core";
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
import clsx from "clsx";
import CheckOutlinedIcon from "@material-ui/icons/CheckOutlined";
import ErrorOutlineOutlinedIcon from "@material-ui/icons/ErrorOutlineOutlined";

const styles = (theme) => ({
  validIcon: {
    color: "green",
  },
  invalidIcon: {
    color: theme.palette.error.main,
  },
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
  render() {
    const {
      intl,
      classes,
      edited,
      title = "Insuree.title",
      titleParams = { label: "" },
      readOnly = true,
      actions,
      edited_id,
    } = this.props;
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
              <Grid container className={classes.item}>
                {!!edited && !!edited.chfId && (
                  <Grid item xs={4} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.InsureeNumberInput"
                      module="insuree"
                      label="Insuree.chfId"
                      required={false}
                      readOnly={readOnly}
                      value={edited?.chfId}
                      new_insuree={!edited?.id}
                      edited_id={edited_id}
                      onChange={(v) => this.updateAttribute("chfId", v)}
                    />
                  </Grid>
                )}
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
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module="insuree"
                    label="Insuree.lastNameArab"
                    required={true}
                    readOnly={readOnly}
                    value={!!edited && !!edited.arabLastName ? edited.arabLastName : ""}
                    onChange={(v) => this.updateAttribute("arabLastName", v)}
                  />
                </Grid>
                <Grid item xs={4} className={classes.item}>
                  <TextInput
                    module="insuree"
                    label="Insuree.otherNamesArab"
                    required={true}
                    readOnly={readOnly}
                    value={!!edited && !!edited.arabOtherNames ? edited.arabOtherNames : ""}
                    onChange={(v) => this.updateAttribute("arabOtherNames", v)}
                  />
                </Grid>
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
                      maxDate={new Date()}
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
                  {!!edited && edited.uuid && (
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
                  )
                  }
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
                      pubRef="insuree.IdentificationTypePicker"
                      module="insuree"
                      value={!!edited && !!edited.typeOfId ? edited.typeOfId.code : null}
                      readOnly={readOnly}
                      withNull={true}
                      required={true}
                      nullLabel={formatMessage(intl, "insuree", "IdentificationType.none")}
                      onChange={(v) => this.updateAttribute("typeOfId", { code: v })}
                    />
                  </Grid>
                  <Grid item xs={3} className={classes.item}>
                    <TextInput
                      module="insuree"
                      label="Insuree.passport"
                      required={true}
                      readOnly={readOnly}
                      value={!!edited && !!edited.passport ? edited.passport : ""}
                      onChange={(v) => this.updateAttribute("passport", !!v ? v : null)}
                      endAdornment={
                        <InputAdornment position="end" className={clsx(
                          !!edited && !!edited.passport && edited.passport.length === 10 && classes.validIcon, 
                          !!edited && !!edited.passport && edited.passport.length !== 10 && classes.invalidIcon)
                          }>
                          <>
                            {!!edited && !!edited.passport && edited.passport.length === 10 && <CheckOutlinedIcon size={20} />}
                            {!!edited && !!edited.passport && edited.passport.length !== 10 && <ErrorOutlineOutlinedIcon size={20}/>}
                          </>
                        </InputAdornment>
                      }
                    />
                  </Grid>
                  <Grid item xs={4} className={classes.item}>
                    <PublishedComponent
                      pubRef="insuree.MembershipPicker"
                      module="insuree"
                      value={!!edited && !!edited.membershipgroup ? edited.membershipgroup : null}
                      readOnly={readOnly}
                      withNull={true}
                      nullLabel={formatMessage(intl, "insuree", "Membership.none")}
                      onChange={(v) => this.updateAttribute("membership", v)}
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
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

export default withModulesManager(withTheme(withStyles(styles)(InsureeMasterPanel)));
