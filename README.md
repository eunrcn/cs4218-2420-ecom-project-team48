MS1 CI link: https://github.com/cs4218/cs4218-2420-ecom-project-team48/actions

MS1 latest workflow link: https://github.com/cs4218/cs4218-2420-ecom-project-team48/actions/runs/13751369135

## Instructions

1. Clone the repository:
   ```sh
   git clone https://github.com/cs4218/cs4218-2420-ecom-project-team48.git
   ```

2. Install dependencies:
   ```sh
   cd cs4218-2420-ecom-project-team48
   npm install
   cd client
   npm install
   ```

3. Run all tests:
   ```sh
   cd ..  # if not at project root
   npm run test
   ```

   Or you can `npm run test:frontend` or `npm run test:backend` to test only frontend or backend respectively.

### Running Virtual Vault

To start the development server:
```
npm run dev
```
The application will be available at [http://localhost:3000](http://localhost:3000).
