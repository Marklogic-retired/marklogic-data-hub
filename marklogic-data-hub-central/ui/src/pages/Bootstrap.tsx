import React, {useState} from "react";
import "./Bootstrap.scss";
import Alert from "react-bootstrap/Alert";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Dropdown from "react-bootstrap/Dropdown";
import Form from "react-bootstrap/Form";
import {Alarm, ArrowRight, CaretRightSquareFill} from "react-bootstrap-icons";
import Nav from "react-bootstrap/Nav";
import Modal from "react-bootstrap/Modal";
import Pagination from "react-bootstrap/Pagination";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import Spinner from "react-bootstrap/Spinner";
import Table from "react-bootstrap/Table";
import Tooltip from "react-bootstrap/Tooltip";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

// TODO Test view for React Bootstrap components, Bootstrap.tsx TO BE REMOVED

const Bootstrap = (props) => {

  let num = 2;

  let tooltips: Array<string> = ["top", "right", "bottom", "left"];

  let active: any = 2;
  let items: any = [];
  for (let number: any = 1; number <= 5; number++) {
    items.push(
      <Pagination.Item key={number} active={number === active}>
        {number}
      </Pagination.Item>,
    );
  }

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const paginationBasic = (
    <div>
      <Pagination>{items}</Pagination>
    </div>
  );

  const popover = (
    <Popover id="popover-basic">
      <Popover.Header as="h4">Popover right</Popover.Header>
      <Popover.Body>
            And here's some <strong>amazing</strong> content. It's very engaging.
            right?
      </Popover.Body>
    </Popover>
  );

  const PopoverExample = () => (
    <OverlayTrigger trigger="click" placement="right" overlay={popover}>
      <Button variant="success">Click me to see</Button>
    </OverlayTrigger>
  );

  return (
    <>
      <p>Examples of React Bootstrap components.</p>

      <h3>Alert</h3>
      <Alert variant="danger" className="alert">
            This is an alert—check it out!
      </Alert>

      <h3>Accordion</h3>
      <Accordion defaultActiveKey="0" className="accordion">
        <Accordion.Item eventKey="0">
          <Accordion.Header>Accordion Item #1</Accordion.Header>
          <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Accordion Item #2</Accordion.Header>
          <Accordion.Body>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea
                commodo consequat. Duis aute irure dolor in reprehenderit in voluptate
                velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
                cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id
                est laborum.
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <h3>Button</h3>
      <Button variant="primary">Primary</Button>

      <h3>Dropdown</h3>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
                Dropdown Button
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item href="#/action-1">Action</Dropdown.Item>
          <Dropdown.Item href="#/action-2">Another action</Dropdown.Item>
          <Dropdown.Item href="#/action-3">Something else</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <h3>Form</h3>
      <Form className="form">
        <Form.Group as={Row} controlId="formBasicEmail">
          <Form.Label column sm="3">Email address</Form.Label>
          <Col sm="9">
            <Form.Control type="email" placeholder="Enter email" />
          </Col>
          <Form.Text className="text-muted">
                We'll never share your email with anyone else.
          </Form.Text>
        </Form.Group>
        <Form.Select aria-label="Default select example">
          <option>Open this select menu</option>
          <option value="1">One</option>
          <option value="2">Two</option>
          <option value="3">Three</option>
        </Form.Select>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" placeholder="Password" />
        </Form.Group>
        <Form.Group controlId="formBasicCheckbox">
          <Form.Check type="checkbox" label="Check me out" />
          <Form.Check type="radio" label="Turn on the radio" />
        </Form.Group>
        <Button variant="primary" type="submit">
                Submit
        </Button>
      </Form>

      <h3>Icons</h3>
      <Alarm color="royalblue" size={48} />
      <ArrowRight color="red" size={64} />
      <CaretRightSquareFill color="green" size={72} />
      <ArrowRight color="red" size={64} />
      <Alarm color="orange" size={96} />

      <h3>Nav</h3>
      <Nav
        activeKey="/home"
        onSelect={(selectedKey) => alert(`selected ${selectedKey}`)}
      >
        <Nav.Item>
          <Nav.Link href="/home">Active</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-1">Link</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="link-2">Link</Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="disabled" disabled>
                Disabled
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <h3>Modal</h3>
      <Button variant="primary" onClick={handleShow}>
            Launch demo modal
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Dialog className="modalClass">
          <Modal.Header closeButton>
            <Modal.Title>Modal heading</Modal.Title>
          </Modal.Header>
          <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
          <Modal.Footer>
            <Button key={1} variant="secondary" onClick={handleClose}>Close</Button>
            <Button key={2} variant="primary" onClick={handleClose}>Save Changes</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal>

      <h3>Pagination</h3>
      {paginationBasic}

      <h3>Popover</h3>
      <PopoverExample />

      <h3>Spinner</h3>
      <Spinner animation="border" variant="primary" />

      <h3>Table</h3>
      <Table striped bordered hover className="tableExample">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <td>2</td>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <td>3</td>
            <td colSpan={num}>Larry the Bird</td>
            <td>@twitter</td>
          </tr>
        </tbody>
      </Table>

      <h3>Tooltip</h3>
      {tooltips.map((placement: any) => (
        <OverlayTrigger
          key={placement}
          placement={placement}
          overlay={
            <Tooltip id={`tooltip-${placement}`}>
                Tooltip on <strong>{placement}</strong>.
            </Tooltip>
          }
        >
          <Button variant="secondary" className="tooltipButton">Tooltip on {placement}</Button>
        </OverlayTrigger>
      ))}

    </>
  );
};

export default Bootstrap;
