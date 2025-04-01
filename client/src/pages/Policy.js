import React from "react";
import Layout from "./../components/Layout";

const Policy = () => {
  return (
    <Layout title={"Privacy Policy"}>
      <div className="row contactus ">
        <div className="col-md-6 ">
          <img
            src="/images/contactus.jpeg"
            alt="contactus"
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-md-4">
          <br></br>
        <p>1. Information We Collect:
Since this website is for testing purposes only, any data you provide may be used exclusively for evaluating system performance and functionality. We may collect:

Test user data: Such as usernames and email addresses (non-sensitive, for testing only).

Activity logs: Including interactions with the website to improve performance testing.</p>

<p>2. Data Security:
We take appropriate measures to protect any test data collected. However, as this is a test environment, users should not input real personal, financial, or sensitive information.</p>

<p>3. Third-Party Services:
Our website may integrate third-party tools for testing (e.g., analytics, security checks), which may collect additional technical data. These services operate under their own privacy policies.</p>

<p>4. Cookies:
We may use cookies to enhance testing capabilities and improve the website’s performance. You can manage cookie preferences in your browser settings.</p>

<p>5. Changes to This Policy:
Since this website is a testing platform, this Privacy Policy may be updated as we refine our testing processes. Any changes will be reflected on this page.</p>


        </div>
      </div>
    </Layout>
  );
};

export default Policy;