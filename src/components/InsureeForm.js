import React, { Component, Fragment } from "react";
import { injectIntl } from "react-intl";
import { connect } from "react-redux";
import { withTheme, withStyles } from "@material-ui/core/styles";
import ReplayIcon from "@material-ui/icons/Replay";
import {
  formatMessageWithValues,
  withModulesManager,
  withHistory,
  historyPush,
  journalize,
  Form,
  ProgressOrError,
  Helmet,
} from "@openimis/fe-core";
import { RIGHT_INSUREE } from "../constants";
import FamilyDisplayPanel from "./FamilyDisplayPanel";
import InsureeMasterPanel from "../components/InsureeMasterPanel";
import InsureeVihMasterPanel from "./InsureeVihMasterPanel";

import { fetchInsureeFull, fetchFamily, fetchUser } from "../actions";
import { insureeLabel } from "../utils/utils";
import FamilyVihDisplayPanel from "./FamilyVihDisplayPanel";

const styles = (theme) => ({
  page: theme.page,
});

const INSUREE_INSUREE_FORM_CONTRIBUTION_KEY = "insuree.InsureeForm";

class InsureeForm extends Component {
  state = {
    lockNew: false,
    reset: 0,
    insuree: this._newInsuree(),
    newInsuree: true,
  };

  _newInsuree() {
    let insuree = {};
    insuree.jsonExt = {};
    return insuree;
  }

  componentDidMount() {
    if(this.props.userId){
      this.props.fetchUser(this.props.modulesManager, this.props.userId);
    }
    if (!!this.props.insuree_uuid) {
      this.setState(
        (state, props) => ({ insuree_uuid: props.insuree_uuid }),
        (e) => this.props.fetchInsureeFull(this.props.modulesManager, this.props.insuree_uuid),
      );
    } else if (!!this.props.family_uuid && (!this.props.family || this.props.family.uuid !== this.props.family_uuid)) {
      this.props.fetchFamily(this.props.modulesManager, this.props.family_uuid);
    } else if (!!this.props.family_uuid) {
      let insuree = { ...this.state.insuree };
      insuree.family = { ...this.props.family };
      this.setState({ insuree });
    }
  }

  back = (e) => {
    const { modulesManager, history, family_uuid, insuree_uuid } = this.props;
    if (family_uuid) {
      historyPush(modulesManager, history, "insuree.route.familyOverview", [family_uuid]);
    } else {
      historyPush(modulesManager, history, "insuree.route.insurees");
    }
  };

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.fetchedInsuree !== this.props.fetchedInsuree && !!this.props.fetchedInsuree) {
      var insuree = this.props.insuree || {};
      insuree.ext = !!insuree.jsonExt ? JSON.parse(insuree.jsonExt) : {};
      this.setState({ insuree, insuree_uuid: insuree.uuid, lockNew: false, newInsuree: false });
    } else if (prevProps.insuree_uuid && !this.props.insuree_uuid) {
      this.setState({ insuree: this._newInsuree(), newInsuree: true, lockNew: false, insuree_uuid: null });
    } else if (prevProps.submittingMutation && !this.props.submittingMutation) {
      this.props.journalize(this.props.mutation);
      this.setState({ reset: this.state.reset + 1 });
    }
  }

  _add = () => {
    this.setState(
      (state) => ({
        insuree: this._newInsuree(),
        newInsuree: true,
        lockNew: false,
        reset: state.reset + 1,
      }),
      (e) => {
        this.props.add();
        this.forceUpdate();
      },
    );
  };

  reload = () => {
    this.props.fetchInsureeFull(this.props.modulesManager, this.state.insuree_uuid);
  };

  canSave = () => {
    if (!this.state.insuree.chfId) return false;
    if (!this.state.insuree.dob) return false;
    if (!this.state.insuree.gender || !this.state.insuree.gender?.code) return false;
    if (!!this.state.insuree.photo && (!this.state.insuree.photo.date || !this.state.insuree.photo.officerId))
      return false;
    if(!this.props.user) return false
    if(!this.props.user.location) return false
    if(this.props.user && this.props.user.location && this.props.user.location.parent.name != "Est")
      return false
    return true;
  };

  _save = (insuree) => {
    this.setState(
      { lockNew: !insuree.uuid }, // avoid duplicates
      (e) => this.props.save(insuree),
    );
  };

  onEditedChanged = (insuree) => {
    this.setState({ insuree, newInsuree: false });
  };

  render() {
    const {
      rights,
      programs,
      insuree_uuid,
      fetchingInsuree,
      fetchedInsuree,
      errorInsuree,
      family,
      family_uuid,
      fetchingFamily,
      fetchedFamily,
      errorFamily,
      readOnly = false,
      add,
      save,
      user
    } = this.props;


    const { insuree } = this.state;
    if (!rights.includes(RIGHT_INSUREE)) return null;
    let actions = [
      {
        doIt: this.reload,
        icon: <ReplayIcon />,
        onlyIfDirty: !readOnly,
      },
    ];
    return (
      <Fragment>
        <Helmet
          title={formatMessageWithValues(this.props.intl, "insuree", "Insuree.title", {
            label: insureeLabel(this.state.insuree),
          })}
        />
        <ProgressOrError progress={fetchingInsuree} error={errorInsuree} />
        <ProgressOrError progress={fetchingFamily} error={errorFamily} />
        {((!!fetchedInsuree && !!insuree && insuree.uuid === insuree_uuid) || !insuree_uuid) &&
          ((!!fetchedFamily && !!family && family.uuid === family_uuid) || !family_uuid) && (
            <Form
              module="insuree"
              title="Insuree.title"
              titleParams={{ label: insureeLabel(this.state.insuree) }}
              edited_id={insuree_uuid}
              rights={rights}
              edited={this.state.insuree}
              reset={this.state.reset}
              back={this.back}
              add={!!add && !this.state.newInsuree ? this._add : null}
              readOnly={readOnly || !!insuree.validityTo}
              actions={actions}
              HeadPanel={!!insuree ? insuree[`email`] == "newhivuser_XM7dw70J0M3N@gmail.com" ? FamilyVihDisplayPanel : FamilyDisplayPanel : FamilyVihDisplayPanel}
              Panels={!!insuree_uuid ? insuree[`email`] == "newhivuser_XM7dw70J0M3N@gmail.com" ? [InsureeVihMasterPanel] : [InsureeMasterPanel] : [InsureeVihMasterPanel]}
              contributedPanelsKey={INSUREE_INSUREE_FORM_CONTRIBUTION_KEY}
              insuree={this.state.insuree}
              onEditedChanged={this.onEditedChanged}
              canSave={this.canSave}
              save={
                !!insuree_uuid ?
                  insuree[`email`] == "newhivuser_XM7dw70J0M3N@gmail.com" ?
                    !!save ? this._save : null : null : !!save ? this._save : null
              }
            />
          )}
      </Fragment>
    );
  }
}

const mapStateToProps = (state, props) => ({
  rights: !!state.core && !!state.core.user && !!state.core.user.i_user ? state.core.user.i_user.rights : [],
  fetchingInsuree: state.insuree.fetchingInsuree,
  errorInsuree: state.insuree.errorInsuree,
  fetchedInsuree: state.insuree.fetchedInsuree,
  insuree: state.insuree.insuree,
  fetchingFamily: state.insuree.fetchingFamily,
  errorFamily: state.insuree.errorFamily,
  fetchedFamily: state.insuree.fetchedFamily,
  family: state.insuree.family,
  submittingMutation: state.insuree.submittingMutation,
  mutation: state.insuree.mutation,
  userId: state.core.user.id,
  user: state.admin.user,
  admin: state.core.user
});

export default withHistory(
  withModulesManager(
    connect(mapStateToProps, { fetchUser, fetchInsureeFull, fetchFamily, journalize })(
      injectIntl(withTheme(withStyles(styles)(InsureeForm))),
    ),
  ),
);
