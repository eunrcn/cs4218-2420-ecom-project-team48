import React from "react";
import Layout from "./../components/Layout";

const About = () => {
  return (
    <Layout title={"About us - Ecommerce app"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/about.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <p className="text-justify mt-2">
          <br></br><br></br><br></br>
          <p> Welcome to SABER – a team of passionate Computer Science students from the National University of Singapore (NUS) dedicated to exploring the boundaries of software development and testing. </p>

<p> Our team, consisting of Shi Kang, Ashley, Brendan, Eunice and, Rayson, adapted this eCommerce platform as a sandbox for software testing. This website is not for commercial use but serves as a controlled environment for evaluating performance, security, and reliability in a real-world setting. </p>

<p> Through this project, we aim to enhance our technical expertise in software engineering, quality assurance, and system optimization while pushing the limits of innovation. </p>

Thank you for visiting our platform!


          </p>
        </div>
      </div>
    </Layout>
  );
};

export default About;