import React, { useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Link }  from 'react-router-dom';
import About from './About/About';
import CheckIn from './CheckIn/CheckIn';
import Post from './Post/Post';
import theme from '../theme';

import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import InfoIcon from '@material-ui/icons/Info';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import StarIcon from '@material-ui/icons/Star';
import StoreIcon from '@material-ui/icons/Store';

const useStyles = makeStyles({
  list: {
    width: 250,
  },
  fullList: {
    width: 'auto',
  },
  header: {
    lineHeight: 0,
  },
  link: {
    [theme.breakpoints.up('xs')]: {
      fontSize: 18,
      lineHeight: "18px",
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: 24,
    },
    textDecoration: "none",
    color: "#333",
    lineHeight: 0,
  },
});

const Header = () => {
  const [menu, setMenu] = useState(false);
  const classes = useStyles();

  const toggleDrawer = (open) => (e) => {
    if (e.type === 'keydown' && (e.key === 'Tab' || e.key === 'Shift')) {
      return;
    }
    setMenu(open);
  };

  const list = () => (
    <div
      className={classes.list}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        <ListItem button component={Link} to="/">
          <ListItemIcon><StarIcon /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button component={Link} to="/findStore">
          <ListItemIcon><StoreIcon /></ListItemIcon>
          <ListItemText primary="Find a store" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button component={Link} to="/about">
          <ListItemIcon><InfoIcon /></ListItemIcon>
          <ListItemText primary="About" />
        </ListItem>
      </List>
    </div>
  );

  return (
    <Router>
      <ThemeProvider theme={theme}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <IconButton onClick={toggleDrawer(true)} edge="start" color="inherit" aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Drawer open={menu} onClose={toggleDrawer(false)}>
            {list()}
          </Drawer>
          <Typography id="headerMessage" variant="h6" color="inherit" className={classes.header}>
            <Link to="/" className={classes.link}>Let's check your favorite フラペ！</Link>
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Switch>
          <Route exact path="/" render={() => <CheckIn />} />
          <Route path="/post/:id" render={() => <Post />} />
          <Route path="/about" render={() => <About />} />
        </Switch>
      </main>
      </ThemeProvider>
    </Router>
  );
}

export default Header;
