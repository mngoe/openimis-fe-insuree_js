import React, { useEffect, Fragment, useRef, useMemo } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";

import { 
  Dialog, 
  Button, 
  DialogActions, 
  DialogContent,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Typography
 } from "@material-ui/core";
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
} from "@openimis/fe-core";
import { fetchInsuree, fetchSubFamilySummary, clearSubFamily, clearInsuree, fetchFamily} from "../actions";
import InsureeSummary from "./InsureeSummary";
import FamilyMembersTable from "./FamilyMembersTable";

const useStyles = makeStyles((theme) => ({
  summary: {
    marginBottom: 32,
  },
  tableContainer: {
    marginTop: 16,
  },
  tableRow: {
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  tableHeader: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  tableCell: {
    color: theme.palette.primary.contrastText,
  }
}));

const EnquiryDialog = ({
  intl,
  modulesManager,
  fetchInsuree,
  fetchSubFamilySummary,
  fetchFamily,
  clearSubFamily,
  clearInsuree,
  fetching,
  fetched,
  insuree,
  subfamilies,
  error,
  onClose,
  open,
  chfid,
  match,
  history,
}) => {
  const classes = useStyles();
  const prevMatchUrl = useRef(null);
  const currentPath = history?.location?.pathname;

  const getFamilyUuidFromPath = (path) => {
    if (!path) return null;
    const familyOverviewMatch = path.match(/\/insuree\/families\/familyOverview\/([^/]+)/);
    return familyOverviewMatch ? familyOverviewMatch[1] : null;
  };

  const refreshCurrentFamily = () => {
    const familyUuid = getFamilyUuidFromPath(currentPath);
    if (familyUuid) {
      fetchFamily(modulesManager, familyUuid);
    }
  };

  const handleClose = () => {
    clearSubFamily();
    clearInsuree();
    onClose();
    refreshCurrentFamily();
  };

  const findPolygamousFamily = (family) => {
    if (family?.familyType?.code === 'P') return family;
    if (family?.parent?.familyType?.code === 'P') return family.parent;
    return null;
  };

  const isPolygamousHead = () => {
    const isHead = 
      insuree?.head || 
      insuree?.family?.headInsuree?.id === insuree?.id ||
      insuree?.id === insuree?.family?.parent?.headInsuree?.id;
    
    const polygamousFamily = findPolygamousFamily(insuree?.family);
    return isHead && !!polygamousFamily;
  };

  const isPolygamousHeadWithSubFamilies = () => {
    return insuree?.id === insuree?.family?.parent?.headInsuree?.id &&
           insuree?.family?.parent?.familyType?.code === 'P' &&
           insuree?.id !== insuree?.family?.headInsuree?.id;
  };

  const getSubFamiliesList = () => {
    if (!subfamilies || !isPolygamousHead()) return [];
    const polygamousFamily = findPolygamousFamily(insuree?.family);
    return subfamilies.filter(subfamily => 
      subfamily.parent?.id === polygamousFamily?.id
    );
  };

  const onDoubleClick = (subfamily, newTab = false) => {
    if (!subfamily?.uuid || !subfamily?.headInsuree?.uuid) {
      console.error("Subfamily or head insuree data is missing");
      return;
    }

    // Récupérer l'UUID de la famille parente
    let parentFamilyUuid = insuree?.family?.parent?.uuid;
    
    // Si pas de parent, utiliser la famille actuelle comme parent
    if (!parentFamilyUuid && insuree?.family?.uuid) {
      parentFamilyUuid = insuree.family.uuid;
    }
    
    // Vérifier si on peut obtenir l'UUID du parent depuis l'URL actuelle
    const currentPathMatch = history?.location?.pathname.match(
      /\/subfamilies\/subFamilyOverview\/([^/]+)\/([^/]+)\/([^/]+)/
    );
    
    if (!parentFamilyUuid && currentPathMatch?.[2]) {
      parentFamilyUuid = currentPathMatch[2];
    }

    if (!parentFamilyUuid) {
      console.error("Could not determine parent family UUID");
      return;
    }

    // Fermer la boîte de dialogue
    handleClose();
  
    // Effectuer la navigation
    try {
      const route = `/insuree/subfamilies/subFamilyOverview/${subfamily.uuid}/${parentFamilyUuid}/${subfamily.headInsuree.uuid}`;
      
      if (newTab) {
        // Ouvrir dans un nouvel onglet
        const url = new URL(window.location.origin + route);
        window.open(url, '_blank');
      } else {
        // Navigation normale avec rechargement
        history.push(route);
        window.location.reload();
      }
    } catch (error) {
      console.error("[EnquiryDialog] Navigation Error:", error);
    }
  };

  useEffect(() => {
    if (open && insuree?.id !== chfid) {
      fetchInsuree(modulesManager, chfid);
    }

    if (!!match?.url && match.url !== prevMatchUrl.current) {
      handleClose();
    }

    if (!!match?.url) {
      prevMatchUrl.current = match.url;
    }
  }, [open, chfid, match?.url]);

  useEffect(() => {
    if (insuree?.family?.uuid) {
      if (insuree.family?.parent?.uuid) {
        fetchSubFamilySummary(modulesManager, { parent_Uuid: insuree.family.parent.uuid });
      } else {
        fetchSubFamilySummary(modulesManager, { parent_Uuid: insuree.family.uuid });
      }
    }
  }, [insuree?.family?.uuid]);

  return (
    <Dialog maxWidth="xl" fullWidth open={open} onClose={handleClose}>
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
            {isPolygamousHeadWithSubFamilies() && (
              <>
                <Typography variant="h6" style={{ marginBottom: '16px' }}>
                  {formatMessage(intl, "insuree", "SubFamilies.title")} ({getSubFamiliesList().length})
                </Typography>
                <Paper className={classes.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow className={classes.tableHeader}>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.insuranceNo")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.lastName")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.otherNames")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.email")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.phone")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.dob")}</TableCell>
                        <TableCell className={classes.tableCell}>{formatMessage(intl, "insuree", "familySummaries.photo")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        const subfamilies = getSubFamiliesList();
                        console.log("Subfamilies data:", subfamilies);
                        return subfamilies.map((subfamily) => {
                          console.log(`Subfamily ${subfamily.uuid} photo:`, subfamily.headInsuree?.photo);
                          return (
                            <TableRow 
                              key={subfamily.uuid}
                              className={classes.tableRow}
                              onDoubleClick={() => onDoubleClick(subfamily)}
                            >
                              <TableCell>{subfamily.headInsuree?.chfId || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.lastName || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.otherNames || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.email || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.phone || ''}</TableCell>
                              <TableCell>{subfamily.headInsuree?.dob || ''}</TableCell>
                              <TableCell>
                                {subfamily.headInsuree?.photo?.photo ? (
                                  <img
                                    src={`data:image/jpeg;base64,${subfamily.headInsuree.photo.photo}`}
                                    alt=""
                                    style={{ width: '80px', height: '80px', objectFit: 'fill', borderRadius: '80%' }}
                                    onError={(e) => {
                                      console.error("Error loading image for", subfamily.headInsuree?.chfId);
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Typography>No Photo</Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        });
                      })()}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
            {!isPolygamousHeadWithSubFamilies() && (
              <FamilyMembersTable insuree={insuree} history={history} />
            )}
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
        <Button onClick={handleClose} color="primary">
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

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchInsuree, fetchSubFamilySummary, fetchFamily, clearSubFamily, clearInsuree}, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
