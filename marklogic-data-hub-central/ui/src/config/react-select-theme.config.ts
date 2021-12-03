// React Select theme config
const reactSelectThemeConfig = {
  option: (provided, state) => ({
      ...provided,
      cursor:  state.isDisabled ? "not-allowed" : "pointer",
      backgroundColor: state.isSelected ? "#fafafa" : "transparent",
      ":hover": {
        backgroundColor:  state.isDisabled ? "transparent" : "#E9F7FE"
      },
      fontWeight: state.isSelected ? "600" : "normal",
      color: state.isDisabled ? "#b5b5b5" : "#333333",
  }),
  container: (provided, state) => ({
      ...provided,
      height: "32px",
      width: "100%",
  }),
  menuList: (provided, state) => ({
      ...provided,
      display: "grid",
  }),
  control: (provided, state) => ({
      ...provided,

      border: state.menuIsOpen ? "1px solid #808cbd" : "1px solid #d9d9d9",
      borderColor: state.menuIsOpen ? "#808cbd" : "#d9d9d9",
      boxShadow: state.menuIsOpen ? "0 0 0 2px rgb(91 105 175 / 20%)" : "none",
      webkitBoxShadow: state.menuIsOpen ? "0 0 0 2px rgb(91 105 175 / 20%)" : "none",
      minHeight: "32px",
      "&:hover": {
        borderColor: "#808cbd",
      },
      ":focus": {
        border: "1px solid #808cbd",
        boxShadow: "0 0 0 2px rgb(91 105 175 / 20%)",
        webkitBoxShadow: "0 0 0 2px rgb(91 105 175 / 20%)"
      },
      cursor: "pointer"
  }),
  indicatorSeparator: (provided, state) => ({
      display: "none"
  }),
  dropdownIndicator: (provided, state) => ({
      ...provided,
      height: "32px"
  })
};

export default reactSelectThemeConfig;