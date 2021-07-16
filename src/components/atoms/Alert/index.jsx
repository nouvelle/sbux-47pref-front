import React, { useContext } from 'react';
// material-ui
import { makeStyles } from '@material-ui/core/styles';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';

import { DataContext } from '../../../App';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    zIndex: 5,
    position: "fixed",
    top: 70,
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const AlertCard = ({ message }) => {
  const classes = useStyles();
  const { alertOpen, setAlertOpen } = useContext(DataContext);

  return (
    <div className={classes.root}>
      <Collapse in={alertOpen}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setAlertOpen(false);
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <AlertTitle>Error</AlertTitle>
          {message}
        </Alert>
      </Collapse>
    </div>
  );
}

export default AlertCard;
