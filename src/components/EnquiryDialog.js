import React, { useEffect, Fragment, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";

import { Dialog, DialogContent, Button, DialogActions } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import {
  formatMessage,
  formatMessageWithValues,
  Contributions,
  Error,
  ProgressOrError,
  withModulesManager,
  withHistory,
  historyPush,
  TableContainer,
  CircularProgress,
} from "@openimis/fe-core";
import { FAMILY_TYPE_POLYGAMY_CODE } from "../constants";
import { fetchInsuree } from "../actions";
import InsureeSummary from "./InsureeSummary";
import SubFamiliesTable from "./SubFamiliesTable";
import FamilyMembersTable from "./FamilyMembersTable";

const useStyles = makeStyles(() => ({
  summary: {
    marginBottom: 32,
  },
}));

const shouldShowSubFamilies = (insuree) => {
  if (!insuree) return false;
  const familyTypeCode = insuree?.family?.familyType?.code;
  const isPolygamyFamilyType = !!familyTypeCode && familyTypeCode === FAMILY_TYPE_POLYGAMY_CODE;
  const isLinkedToSubFamily = !!insuree?.family?.parent?.uuid;
  return isPolygamyFamilyType || isLinkedToSubFamily;
};

const EnquiryDialog = ({
  intl,
  modulesManager,
  fetchInsuree,
  fetching,
  fetched,
  insuree,
  error,
  onClose,
  open,
  chfid,
  match,
}) => {
  const classes = useStyles();
  const prevMatchUrl = useRef(null);
//recuperer les données de l assurer
  useEffect(() => {
    if (open && insuree?.id !== chfid) {
      fetchInsuree(modulesManager, chfid);
    }

    if (!!match?.url && match.url !== prevMatchUrl.current) {
      onClose();
    }

    if (!!match?.url) {
      prevMatchUrl.current = match.url;
    }
  }, [open, chfid, match?.url]);
  return (
    <Dialog maxWidth="xl" fullWidth open={open} onClose={onClose}>
      <DialogContent>
        <ProgressOrError progress={fetching} error={error} />
        {!!fetched && !insuree && (
          <Error
            error={{
              code: formatMessage(intl, "insuree", "notFound"),
              detail: formatMessageWithValues(intl, "insuree", "chfIdNotFound", { chfid }),
            }}
          />
        )}
        {!fetching && insuree && (
          <Fragment>
            <InsureeSummary modulesManager={modulesManager} insuree={insuree} className={classes.summary} />
            {(() => {
              if (insuree.head) {
                return <FamilyMembersTable />;
              }
              if (shouldShowSubFamilies(insuree)) {
                const familyUuid = insuree.family?.parent?.uuid || insuree.family?.uuid;
                if (!familyUuid) {
                  return null;
                }
                return <SubFamiliesTable familyUuid={familyUuid} />;
              }
              return <FamilyMembersTable />;
            })()}
            <Contributions
              contributionKey="insuree.EnquiryDialog"
              insuree={insuree}
              disableSelection
              hideAddPolicyButton
            />
          </Fragment>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          {formatMessage(intl, "insuree", "close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const mapStateToProps = (state) => ({
  fetching: state.insuree.fetchingInsuree,
  fetched: state.insuree.fetchedInsuree,
  insuree: state.insuree.insuree,
  subfamilies: state.insuree.subFamilies,
  error: state.insuree.errorInsuree,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchInsuree }, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
