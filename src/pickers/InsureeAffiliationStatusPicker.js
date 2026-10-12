import React from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";
import { INSUREE_AFFILIATION_STATUSES } from "../constants";

const InsureeAffiliationStatusPicker = (props) => {
  return (
    <ConstantBasedPicker 
      module="insuree" 
      label="affiliationStatus" 
      constants={INSUREE_AFFILIATION_STATUSES} 
      {...props} 
    />
  );
};

export default InsureeAffiliationStatusPicker;