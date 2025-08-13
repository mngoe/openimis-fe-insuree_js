import React, { useEffect, Fragment, useRef, useMemo, useCallback } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from "react-intl";

import { 
  Dialog,
  DialogContent,
  Button, 
  DialogActions,
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
import {
   fetchInsuree,
   fetchSubFamilySummary,
   clearSubFamily,
   clearInsuree,
   fetchFamily 
} from "../actions";
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
  tableHeader: theme.paper.header,
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

  const handleCloseByUser = () => {
    const path = history?.location?.pathname;
    if (path && (
      /\/insuree\/insurees\/insuree\/[^/]+\/[^/]+$/.test(path) ||
      /\/insuree\/insurees\/insuree\/[^/]+$/.test(path)
    )) {
      window.location.reload();
    } else {
      handleClose();
    }
  };

  // Fonctions utilitaires pour gérer les familles polygames
  const findPolygamousFamily = useCallback((family) => {
    console.log('[EnquiryDialog] Recherche de la famille polygame pour la famille:', family?.uuid);
    if (family?.familyType?.code === 'P') {
      console.log('[EnquiryDialog] Famille courante est polygame');
      return family;
    }
    if (family?.parent?.familyType?.code === 'P') {
      console.log('[EnquiryDialog] Parent de la famille courante est polygame');
      return family.parent;
    }
    console.log('[EnquiryDialog] Aucune famille polygame trouvée');
    return null;
  }, []);

  const isPolygamousHead = useCallback(() => {
    const isHead = 
      insuree?.head || 
      insuree?.family?.headInsuree?.id === insuree?.id ||
      insuree?.id === insuree?.family?.parent?.headInsuree?.id;
    
    const polygamousFamily = findPolygamousFamily(insuree?.family);
    const result = isHead && !!polygamousFamily;
    console.log('[EnquiryDialog] Est tête de famille polygame?', result, { isHead, hasPolygamousFamily: !!polygamousFamily });
    return result;
  }, [insuree, findPolygamousFamily]);

  const isPolygamousHeadWithSubFamilies = useCallback(() => {
    const result = insuree?.id === insuree?.family?.parent?.headInsuree?.id &&
                  insuree?.family?.parent?.familyType?.code === 'P' &&
                  insuree?.id !== insuree?.family?.headInsuree?.id;
    console.log('[EnquiryDialog] Est tête de famille polygame avec sous-familles?', result);
    return result;
  }, [insuree]);

  // Liste des sous-familles filtrée et mémorisée
  const subFamiliesList = useMemo(() => {
    console.log('[EnquiryDialog] Mise à jour de la liste des sous-familles');
    
    // Vérifier d'abord les conditions d'arrêt rapide
    if (!subfamilies?.length || !insuree?.family) {
      console.log('[EnquiryDialog] Aucune sous-famille à afficher (données manquantes)');
      return [];
    }
    
    // Trouver la famille polygame une seule fois
    const polygamousFamily = findPolygamousFamily(insuree.family);
    if (!polygamousFamily) {
      console.log('[EnquiryDialog] Aucune famille polygame trouvée');
      return [];
    }
    
    // Filtrer directement les sous-familles en utilisant parent.uuid
    console.log('[EnquiryDialog] Détails du filtrage des sous-familles:', {
      polygamousFamily: {
        id: polygamousFamily.id,
        uuid: polygamousFamily.uuid,
        headInsureeId: polygamousFamily.headInsuree?.id,
        familyType: polygamousFamily.familyType?.code
      },
      subfamiliesSample: subfamilies.slice(0, 3).map(sf => ({
        id: sf.id,
        uuid: sf.uuid,
        parentId: sf.parent?.id,
        parentUuid: sf.parent?.uuid,
        headInsureeId: sf.headInsuree?.id
      }))
    });

    const filtered = subfamilies.filter(subfamily => {
      const isMatch = subfamily.parent?.uuid === polygamousFamily.uuid;
      console.log(`[EnquiryDialog] Vérification sous-famille ${subfamily.uuid}:`, {
        subfamilyParentUuid: subfamily.parent?.uuid,
        polygamousFamilyUuid: polygamousFamily.uuid,
        isMatch
      });
      return isMatch;
    });
    
    console.log(`[EnquiryDialog] ${filtered.length} sous-familles trouvées pour la famille polygame`, {
      polygamousFamilyUuid: polygamousFamily.uuid,
      subfamiliesCount: subfamilies.length,
      filteredCount: filtered.length,
      filteredUuids: filtered.map(f => f.uuid)
    });
    
    return filtered;
  }, [subfamilies, findPolygamousFamily, insuree?.family]);

  const onDoubleClick = (subfamily, event) => {
    console.log('[EnquiryDialog] Double-clic sur la sous-famille:', subfamily?.uuid);
    
    // Empêcher le comportement par défaut du double-clic
    event.preventDefault();
    event.stopPropagation();
    
    const currentPathMatch = history?.location?.pathname.match(
      /\/subfamilies\/subFamilyOverview\/([^/]+)\/([^/]+)\/([^/]+)/
    );
    
    const navigationDetails = {
      subfamily: {
        uuid: subfamily?.uuid,
        headInsureeUuid: subfamily?.headInsuree?.uuid,
        familyType: subfamily?.familyType?.code
      },
      currentFamily: {
        uuid: insuree?.family?.uuid,
        familyType: insuree?.family?.familyType?.code,
        parentUuid: insuree?.family?.parent?.uuid
      },
      currentPath: {
        full: history?.location?.pathname,
        parsed: currentPathMatch ? {
          subfamilyUuid: currentPathMatch[1],
          parentFamilyUuid: currentPathMatch[2],
          headInsureeUuid: currentPathMatch[3]
        } : null
      }
    };

    console.log('[EnquiryDialog] Détails de navigation:', navigationDetails);

    if (!subfamily?.uuid || !subfamily?.headInsuree?.uuid) {
      console.error('[EnquiryDialog] Impossible de naviguer: UUID de la sous-famille ou du chef de famille manquant');
      return;
    }

    let parentFamilyUuid = insuree?.family?.parent?.uuid;
    
    if (!parentFamilyUuid && insuree?.family?.uuid) {
      console.log('[EnquiryDialog] Utilisation de l\'UUID de la famille courante comme parent');
      parentFamilyUuid = insuree.family.uuid;
    }
    
    if (!parentFamilyUuid && navigationDetails.currentPath.parsed?.parentFamilyUuid) {
      console.log('[EnquiryDialog] Utilisation de l\'UUID du parent depuis l\'URL courante');
      parentFamilyUuid = navigationDetails.currentPath.parsed.parentFamilyUuid;
    }

    if (!parentFamilyUuid) {
      console.error('[EnquiryDialog] Impossible de déterminer l\'UUID de la famille parente');
      return;
    }

    const finalNavigationParams = {
      subfamilyUuid: subfamily.uuid,
      parentFamilyUuid,
      headInsureeUuid: subfamily.headInsuree.uuid
    };

    console.log('[EnquiryDialog] Paramètres de navigation finaux:', finalNavigationParams);

    // Ne pas fermer la boîte de dialogue actuelle
    // handleClose();
  
    try {
      console.log('[EnquiryDialog] Navigation vers la sous-famille dans un nouvel onglet');
      // Toujours ouvrir dans un nouvel onglet (newTab = true)
      historyPush(
        modulesManager, 
        history, 
        "insuree.route.subFamilyOverview",
        [finalNavigationParams.subfamilyUuid, finalNavigationParams.parentFamilyUuid, finalNavigationParams.headInsureeUuid],
        true // Toujours ouvrir dans un nouvel onglet
      );
    } catch (error) {
      console.error('[EnquiryDialog] Erreur lors de la navigation vers la sous-famille:', error);
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
                  {formatMessage(intl, "insuree", "SubFamilies.title")} ({subFamiliesList.length})
                </Typography>
                <Paper className={classes.tableContainer}>
                  <Table>
                    <TableHead>
                      <TableRow className={classes.tableHeader}>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.insuranceNo")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.lastName")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.otherNames")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.email")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.phone")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.dob")}</TableCell>
                        <TableCell >{formatMessage(intl, "insuree", "familySummaries.photo")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {subFamiliesList.map((subfamily) => (
                        <TableRow 
                          key={subfamily.uuid}
                          className={classes.tableRow}
                          onDoubleClick={(e) => onDoubleClick(subfamily, e)}
                        >
                          <TableCell>{subfamily.headInsuree?.chfId || ''}</TableCell>
                          <TableCell>{subfamily.headInsuree?.lastName || ''}</TableCell>
                          <TableCell>{subfamily.headInsuree?.otherNames || ''}</TableCell>
                          <TableCell>{subfamily.headInsuree?.email || ''}</TableCell>
                          <TableCell>{subfamily.headInsuree?.phone || ''}</TableCell>
                          <TableCell>{subfamily.headInsuree?.dob || ''}</TableCell>
                          <TableCell>
                            {subfamily.headInsuree?.photo ? (
                              <img
                                src={`data:image/jpeg;base64,${subfamily.headInsuree.photo.photo}`}
                                alt=""
                                style={{ width: '80px', height: '80px', objectFit: 'fill', borderRadius: '80%' }}
                              />
                            ) : (
                              <Typography>No Photo</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </>
            )}
            {!isPolygamousHeadWithSubFamilies() && (
              <FamilyMembersTable />
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
        <Button onClick={handleCloseByUser} color="primary">
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

const mapDispatchToProps = (dispatch) => bindActionCreators({ fetchInsuree, fetchSubFamilySummary, fetchFamily, clearSubFamily, clearInsuree }, dispatch);
export default withModulesManager(withHistory(connect(mapStateToProps, mapDispatchToProps)(injectIntl(EnquiryDialog))));
