import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { TableContainer, TableHead, TableBody, Table, TableCell, TableRow, Paper } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";

import { useModulesManager, useTranslations } from "@openimis/fe-core";
import { fetchFamilyMembers } from "../actions";
import { DEFAULT, HYPHEN, MODULE_NAME } from "../constants";

const useStyles = makeStyles((theme) => ({
  footer: {
    marginInline: 16,
    marginBlock: 12,
  },
  tableContainer: {
    marginTop: theme.spacing(1),
  },
  cell: {
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitle: theme.table.title,
  actionCell: {
    width: 60,
  },
  header: theme.table.header,
}));

const FAMILY_MEMBERS_HEADERS = [
  "FamilyMembersTable.InsuranceNo",
  "FamilyMembersTable.memberName",
  "FamilyMembersTable.phone",
  "FamilyMembersTable.genre",
  "FamilyMembersTable.birthDate",
  "FamilyMembersTable.photo",
];

const FamilyMembersTable = () => {
  const dispatch = useDispatch();
  const modulesManager = useModulesManager();
  const classes = useStyles();
  const { formatMessage } = useTranslations(MODULE_NAME, modulesManager);
  const { familyMembers, insuree } = useSelector((store) => store.insuree);
  const renderLastNameFirst = modulesManager.getConf(
    "fe-insuree",
    "renderLastNameFirst",
    DEFAULT.RENDER_LAST_NAME_FIRST,
  );

  useEffect(() => {
    if (!insuree) return;

    dispatch(fetchFamilyMembers(modulesManager, [`familyUuid: "${insuree?.family?.uuid}"`]));
  }, [insuree]);

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead className={classes.header}>
          <TableRow className={classes.headerTitle}>
            {FAMILY_MEMBERS_HEADERS.map((header) => (
              <TableCell className={classes.cell} key={header}> {formatMessage(header)} </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {familyMembers?.length !== 0 ? (
            familyMembers?.map((familyMember) => (
              <TableRow key={familyMember?.uuid}>
                <TableCell className={classes.cell}> {familyMember?.chfId} </TableCell>
                <TableCell className={classes.cell}>
                  {renderLastNameFirst
                    ? `${familyMember?.lastName} ${familyMember?.otherNames}`
                    : `${familyMember?.otherNames} ${familyMember?.lastName}`}
                </TableCell>
                <TableCell className={classes.cell}> {familyMember?.phone ?? HYPHEN} </TableCell>
                <TableCell className={classes.cell}> {familyMember?.gender?.code ?? HYPHEN} </TableCell>
                <TableCell className={classes.cell}> {familyMember?.dob ?? HYPHEN} </TableCell>
                <TableCell className={classes.cell}>
                  {familyMember?.photo ? (
                    <img
                      src={`data:image/jpeg;base64,${familyMember.photo.photo}`}
                      alt=""
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: "50%" }}
                    />
                  ) : (
                    HYPHEN
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell className={classes.cell}> {formatMessage("insuree.FamilyMembersTable.noMembers")} </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FamilyMembersTable;