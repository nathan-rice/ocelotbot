import {
  Button,
  Container,
  InputLabel,
  List,
  ListItem,
  MenuItem,
  Select,
  TextField,
  Typography,
  Paper,
  Grid,
  CardHeader,
  ListSubheader,
} from "@material-ui/core";
import React, { useState } from "react";
import { v4 } from "uuid";
import _ from "lodash";

const containerStyle = { marginBottom: "30px" };

export const Planner = () => {
  const [breadTypes, setBreadTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  return (
    <div>
      <MenuCreator breadTypes={breadTypes} setBreadTypes={setBreadTypes} />
      <OrderManager
        breadTypes={breadTypes}
        customers={customers}
        setCustomers={setCustomers}
        orders={orders}
        setOrders={setOrders}
      />
      <LoafPlanner orders={orders} />
    </div>
  );
};

// const cartesian = (...a) =>
//   a.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));

const cartesian = (...arr) => {
  return arr.reduce(
    (acc, val) => {
      return acc
        .map((el) => {
          return val.map((element) => {
            return el.concat([element]);
          });
        })
        .reduce((acc, val) => acc.concat(val), []);
    },
    [[]]
  );
};

const loafKey = (o) => `${o.breadType}:${o.loafShape}`;

const score = (plan, orders) => {
  let s = 0;
  const ordersByCustomer = _.groupBy(orders, (o) => o.customer);
  const ordersByExactLoaf = _.groupBy(orders, loafKey);
  const customers = _.keys(ordersByCustomer);
  const customerOrdersMet = {};
  customers.forEach((c) => (customerOrdersMet[c] = 0));
  plan.forEach((o) => {
    customerOrdersMet[o.customer] += 1;
    // Also need to handle matching orders from other customers
    const k = loafKey(o);
    ordersByExactLoaf[k].forEach(oo => {
      if (oo != o) {
        customerOrdersMet[oo.customer] += 1;
      }
    });
    if (o.loafShape == "Round") {
      s -= 1;
    }
  });
  const allCustomersHaveAnOrderMet = _.min(_.values(customerOrdersMet)) > 0;
  if (!allCustomersHaveAnOrderMet) {
    return Number.NEGATIVE_INFINITY;
  }
  return s;
};

const optimizeBread = (orders) => {
  const ordersByType = _.groupBy(orders, (o) => o.breadType);
  // For this problem, the easiest approach is to examine every combination of customer orders by loaf type
  // looking for the one with the lowest score (based on unfulfilled orders and loaf shape).
  const vals = _.values(ordersByType);
  const plans = cartesian(...vals);
  const scores = plans.map((p) => score(p, orders));
  const results = _.maxBy(_.zip(plans, scores), (ps) => ps[1]);
  return results;
};

export const LoafPlanner = ({ orders }) => {
  const [optimizedBread, setOptimizedBread] = useState([]);
  const onClick = () => {
    const [plan, score] = optimizeBread(orders);
    if (score == Number.NEGATIVE_INFINITY) {
      alert("No solution exists!");
    } else {
      setOptimizedBread(plan);
    }
  };
  const disabled = !!(orders.length == 0);
  return (
    <Container>
      <CardHeader title="🔮 Bread Optimizer"></CardHeader>
      <Paper>
        <Grid container justify="space-between" style={{ padding: "10px" }}>
          <Grid item>
            <List>
              {optimizedBread.map((ob, i) => (
                <ListItem
                  key={i}
                >{`${ob.breadType}, ${ob.loafShape}`}</ListItem>
              ))}
            </List>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            onClick={onClick}
            disabled={disabled}
          >
            Optimize!
          </Button>
        </Grid>
      </Paper>
    </Container>
  );
};

export const MenuCreator = ({ breadTypes, setBreadTypes }) => {
  const [newBreadType, setNewBreadType] = useState("");
  const onClick = (e) => {
    const newBreadTypes = [...breadTypes, newBreadType];
    setBreadTypes(newBreadTypes);
    setNewBreadType("");
  };
  const onClickRemove = (breadType) => {
    const newBreadTypes = _.filter(breadTypes, (bt) => bt != breadType);
    setBreadTypes(newBreadTypes);
  };
  const onInput = (e) => {
    setNewBreadType(e.target.value);
  };
  const subheader = <ListSubheader>Bread Types</ListSubheader>;
  return (
    <Container style={containerStyle} maxWidth="lg">
      <CardHeader title="🍞 Menu Creator"></CardHeader>
      <Paper style={{}}>
        <List subheader={subheader}>
          {breadTypes.map((bt) => (
            <ListItem key={bt}>
              <Grid container justify="space-between">
                <Grid item>
                  <Typography>{bt}</Typography>
                </Grid>
                <Grid item>
                  <Button variant="contained" onClick={() => onClickRemove(bt)}>
                    Remove
                  </Button>
                </Grid>
              </Grid>
            </ListItem>
          ))}
        </List>
        <Grid
          container
          justify="space-between"
          style={{
            paddingLeft: "16px",
            paddingRight: "16px",
            paddingBottom: "8px",
            paddingTop: "8px",
          }}
        >
          <Grid item>
            <TextField
              id="breadtype-submission-input"
              label="Bread Type"
              variant="outlined"
              value={newBreadType}
              onInput={onInput}
            />
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={onClick}>
              Add
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export const OrderManager = ({
  breadTypes,
  customers,
  setCustomers,
  orders,
  setOrders,
}) => {
  const [newCustomer, setNewCustomer] = useState("");
  const onClick = (e) => {
    const newCustomers = [...customers, newCustomer];
    setCustomers(newCustomers);
    setNewCustomer("");
  };
  const ordersByCustomer = _.groupBy(orders, (o) => o.customer);
  const addOrder = ({ customer, breadType, loafShape }) => {
    if (breadType) {
      const newOrders = [...orders, { customer, breadType, loafShape }];
      setOrders(newOrders);
    }
  };
  const delOrder = (order) => {
    const newOrders = _.filter(orders, (o) => !_.isEqual(o, order));
    setOrders(newOrders);
  };
  return (
    <>
      <Container style={containerStyle} maxWidth="lg">
        <Paper style={{}}>
          <CardHeader title="👥 Customer Creator"></CardHeader>
          <Grid
            container
            justify="space-between"
            style={{
              paddingLeft: "16px",
              paddingRight: "16px",
              paddingBottom: "8px",
              paddingTop: "8px",
            }}
          >
            <Grid item>
              <TextField
                id="customer-submission-input"
                label="Customer Name"
                value={newCustomer}
                variant="outlined"
                onInput={(e) => setNewCustomer(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button variant="contained" onClick={onClick}>
                Add
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Container>
      <Container style={containerStyle}>
        <Paper>
          <CardHeader title="🛒 Order Creator"></CardHeader>
          {customers.map((c) => (
            <CustomerOrder
              key={c}
              customer={c}
              orders={ordersByCustomer[c] || []}
              breadTypes={breadTypes}
              addOrder={addOrder}
              delOrder={delOrder}
            />
          ))}
        </Paper>
      </Container>
    </>
  );
};

const toValue = (t) => t; // convert to lower case with underscores

export const CustomerOrder = ({
  breadTypes,
  customer,
  orders,
  addOrder,
  delOrder,
}) => {
  const defaultBreadType = _.head(breadTypes) || "";
  const [newOrder, setNewOrder] = useState({
    customer,
    loafShape: "Square",
    breadType: defaultBreadType,
  });
  const onChangeBreadType = (e) =>
    setNewOrder({ ...newOrder, breadType: e.target.value });
  const onChangeLoafShape = (e) =>
    setNewOrder({ ...newOrder, loafShape: e.target.value });
  const onClickAdd = (e) => addOrder(newOrder);
  const subheader = <ListSubheader>{customer}</ListSubheader>;
  const breadTypeLabelId = v4();
  const loafShapeLabelId = v4();
  return (
    <div>
      <List subheader={subheader}>
        {orders.map((o) => (
          <ListItem key={`${o.customer}:${o.breadType}:${o.loafShape}`}>
            <Grid
              container
              justify="space-between"
              style={{
                paddingLeft: "16px",
                paddingRight: "0px",
                paddingBottom: "8px",
                paddingTop: "8px",
              }}
            >
              <Grid item>
                <Typography>{o.breadType}</Typography>
              </Grid>
              <Grid item>
                <Typography>{o.loafShape}</Typography>
              </Grid>
              <Grid item>
                <Button variant="contained" onClick={() => delOrder(o)}>
                  Cancel
                </Button>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
      <Grid
        container
        justify="space-between"
        style={{
          paddingLeft: "32px",
          paddingRight: "16px",
          paddingBottom: "8px",
          paddingTop: "8px",
        }}
      >
        <Grid item>
          <InputLabel id={breadTypeLabelId}>Bread Type</InputLabel>
          <Select
            value={newOrder.breadType}
            labelId={breadTypeLabelId}
            onChange={onChangeBreadType}
          >
            <MenuItem value="" key={-1}>
              --
            </MenuItem>
            {breadTypes.map((bt, i) => (
              <MenuItem value={toValue(bt)} key={i}>
                {bt}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item>
          <InputLabel id={loafShapeLabelId}>Loaf Shape</InputLabel>
          <Select
            value={newOrder.loafShape}
            labelId={loafShapeLabelId}
            onChange={onChangeLoafShape}
          >
            <MenuItem value="Square">Square</MenuItem>
            <MenuItem value="Round">Round</MenuItem>
          </Select>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={onClickAdd}>
            Add
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
