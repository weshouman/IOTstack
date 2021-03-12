// import React, { Fragment, useState, useEffect } from 'react';
import React, { Fragment, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
// import Box from '@material-ui/core/Box';
// import Tooltip from '@material-ui/core/Tooltip';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';

const getModalStyle = () => {
  const top = 15;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-50%, -${left}%)`,
  };
};

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: '50%',
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const BuildCompletedModal = ({
  isOpen,
  handleClose,
  buildStack,
  scriptTemplates,
  dispatchGetScriptTemplates,
  dispatchDownloadBuildFile,
  downloadLinkRef
}) => {
  const [showBootstrapScript, setShowBootstrapScript] = useState(false);
  const [associatedBuildFiles, setAssociatedBuildFiles] = useState(false);

  // const { build, files, issues } = buildStack?.payload ?? {};
  const { build } = buildStack?.payload ?? {};

  const bootstrapBody = () => {
    if ((typeof scriptTemplates?.scripts?.completed?.bootstrap?.payload ?? null) === 'string') {
      return scriptTemplates.scripts.completed.bootstrap?.payload;
    }
    return '';
  };

  const closeModal = (event) => {
    setShowBootstrapScript(false);
    setAssociatedBuildFiles(false);
    if (typeof handleClose === 'function') {
      handleClose(event);
    }
  }

  // const linkRef = React.createRef();
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <h2 id="simple-modal-title">Build {build} Complete</h2>
      <p id="simple-modal-description">
        Choose from the following options:
      </p>
      <Grid
        container
        spacing={4}
      >
        <Grid item
          display="flex"
        >
          <Button variant="contained" onClick={() => {
            return dispatchDownloadBuildFile({ build, type: 'zip', linkRef: downloadLinkRef });
          }}>Download build zip file</Button>
        </Grid>
        <Grid item
          display="flex"
        >
          <Button variant="contained" onClick={() => {
            dispatchGetScriptTemplates({ scriptName: 'bootstrap', options: { build } })
            setShowBootstrapScript(!showBootstrapScript);
            setAssociatedBuildFiles(false);
          }}>Show bootstrap script installer</Button>
        </Grid>
        <Grid item
          display="flex"
        >
          <Button variant="contained" onClick={() => {
            setShowBootstrapScript(false);
            setAssociatedBuildFiles(!associatedBuildFiles)
          }}>Show associated build files</Button>
        </Grid>
      </Grid>
      <Fragment>
        {showBootstrapScript
        && (
          <Fragment>
            <pre>{bootstrapBody()}</pre>
          </Fragment>
        )}
        {associatedBuildFiles
        && (
          <Fragment>
            <pre>associatedBuildFiles</pre>
          </Fragment>
        )}
      </Fragment>
      <BuildCompletedModal />
    </div>
  );
  
  return (
    <Modal
      open={isOpen}
      onClose={closeModal}
      aria-labelledby="simple-modal-title"
      aria-describedby="simple-modal-description"
    >
      {body}
    </Modal>
  );
};

export default BuildCompletedModal;