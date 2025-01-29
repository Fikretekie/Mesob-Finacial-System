import React, { useState, useRef } from "react";

// reactstrap components
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  FormGroup,
  Form,
  Input,
  Button,
  Spinner,
} from "reactstrap";

import axios from "axios";

// core components
import PanelHeader from "components/PanelHeader/PanelHeader.js";
import Helmet from "react-helmet";
import { Editor } from "@tinymce/tinymce-react";
import NotificationAlert from "react-notification-alert";
import "react-notification-alert/dist/animate.css";

function Notifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [description, setDescription] = useState("");
  const [sendNotificationBtnLoading, setSendNotificationBtnLoading] =
    useState(false);
  const editorRef = useRef(null);

  const notificationAlertRef = useRef(null);
  const notify = (place, message, type) => {
    const options = {
      place: place,
      message: (
        <div>
          <div>{message}</div>
        </div>
      ),
      type: type,
      icon: "now-ui-icons ui-1_bell-53",
      autoDismiss: 7,
    };
    notificationAlertRef.current.notificationAlert(options);
  };

  const handleEditorChange = (content, editor) => {
    setDescription(content);
  };

  const handleNotificationSend = async (e) => {
    e.preventDefault();

    const Title = title;
    const Body = body;
    const Description = description;

    // console.log("title: ", title, "\n");
    // console.log("body: ", body, "\n");
    // console.log("description : ", description, "\n");

    const payload = {
      Title: Title,
      Body: Body,
      Description: Description,
    };

    try {
      setSendNotificationBtnLoading(true);
      const response = await axios.post(
        "https://9k4d3mwmtg.execute-api.us-east-1.amazonaws.com/dev/notification_topic?arn=arn:aws:sns:us-east-1:807954077262:EnpointTopic",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);

      if (response.status === 200) {
        setTitle("");
        setBody("");
        setDescription("");
        setSendNotificationBtnLoading(false);

        notify("tr", "Notification sent successfully!", "success");
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Notifications - Mesob Finance</title>
      </Helmet>

      <PanelHeader
        size="sm"
        content={
          <div className="header text-center">
            <h2 className="title">Notifications</h2>
          </div>
        }
      />
      <NotificationAlert ref={notificationAlertRef} />
      <div className="content">
        <Row>
          <Col md="12">
            <Card>
              <CardHeader>
                <h5 className="title">Notifications</h5>
              </CardHeader>
              <CardBody>
                <Form>
                  <Row>
                    <Col className="pr-1" md="12">
                      <FormGroup>
                        <label>Title</label>
                        <Input
                          placeholder="Title"
                          type="text"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col className="pr-1" md="12">
                      <FormGroup>
                        <label>Body</label>
                        <Input
                          placeholder="Body"
                          type="text"
                          value={body}
                          onChange={(e) => setBody(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <label>Description</label>
                        {/* <Input placeholder="Body" type="textarea" /> */}
                        <Editor
                          apiKey={process.env.REACT_APP_TINYMCE_API_KEY}
                          onInit={(evt, editor) => (editorRef.current = editor)}
                          initialValue=""
                          init={{
                            height: 300,
                            menubar: true,
                            plugins: [
                              "advlist autolink lists link image charmap print preview anchor",
                              "searchreplace visualblocks code fullscreen",
                              "insertdatetime media table paste code help wordcount",
                              "placeholder",
                            ],
                            toolbar:
                              "undo redo | formatselect | " +
                              "bold italic backcolor | alignleft aligncenter " +
                              "alignright alignjustify | bullist numlist outdent indent | " +
                              "removeformat",
                            placeholder: "Write your message here...",
                          }}
                          onEditorChange={handleEditorChange}
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="12">
                      <Button
                        color="info"
                        className="btn-round"
                        onClick={handleNotificationSend}
                        disabled={sendNotificationBtnLoading}
                      >
                        {sendNotificationBtnLoading ? (
                          <>
                            Sending...
                            <Spinner
                              color="primary"
                              size="sm"
                              className="ml-1"
                            />
                          </>
                        ) : (
                          "Send Notification"
                        )}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Notifications;
