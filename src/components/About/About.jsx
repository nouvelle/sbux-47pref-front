import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import theme from '../../theme';
import '../../index.css'

const useStyles = makeStyles(() => ({
  root: {
    display: 'flex'
  },
  content: {
    flexGrow: 1,
    height: '100vh',
    overflow: 'auto'
  },
  container: {
    height: '90vh',
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    backgroundImage: 'url("/img/store04.jpg")',
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat'
  },
}));

const About = () => {
  const classes = useStyles();

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Typography id="aboutMessage">Thank you for visiting this app :)</Typography>
    </Container>
  );
}

export default About;
