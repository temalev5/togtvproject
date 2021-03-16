import React from "react";

export default function Search(params) {
  return (
    <div className="ui disabled category search">
      <div className="ui icon input">
        <input
          className="prompt"
          type="text"
          placeholder="Search animals..."
        ></input>
        <i className="search icon"></i>
      </div>
      <div className="results"></div>
    </div>
  );
}
