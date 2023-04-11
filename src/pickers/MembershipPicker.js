import React, { useState } from "react";
import { Autocomplete, useGraphqlQuery, useTranslations } from "@openimis/fe-core";

const MembershipPicker = (props) => {
  const {
    onChange,
    readOnly,
    required,
    withLabel,
    withPlaceholder,
    value,
    label,
    filterOptions,
    filterSelectedOptions,
    placeholder,
    extraFragment,
    multiple,
  } = props;
  const [searchString, setSearchString] = useState(null);
  const { formatMessage } = useTranslations("insuree");

  const { isLoading, data, error } = useGraphqlQuery(
    `query ($searchString: String) {
      membershipgroups(name: $searchString, first: 10) {
        edges {
          node {
            id name
            ${extraFragment ?? ""}
          }
        }
      }
    }`,
    { searchString },
    { skip: true },
  );

  return (
    <Autocomplete
      multiple={multiple}
      required={required}
      placeholder={placeholder ?? formatMessage("MembershipPicker.placeholder")}
      label={label ?? formatMessage("MembershipPicker.label")}
      error={error}
      withLabel={withLabel}
      withPlaceholder={withPlaceholder}
      readOnly={readOnly}
      options={data?.membershipgroups?.edges.map((edge) => edge.node) ?? []}
      isLoading={isLoading}
      value={value}
      getOptionLabel={(option) => `${option.name}`}
      onChange={onChange}
      filterOptions={filterOptions}
      filterSelectedOptions={filterSelectedOptions}
      onInputChange={setSearchString}
    />
  );
};

export default MembershipPicker;