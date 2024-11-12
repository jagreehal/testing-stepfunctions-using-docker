# Testing Step Functions Using Docker

This project demonstrates how to test AWS Step Functions locally using Docker. It includes a simple state machine and tests to verify its execution.

## Prerequisites

- Docker
- Node.js

## Setup

1. Clone the repository:

   ```sh
   git clone https://github.com/yourusername/testing-stepfunctions-using-docker.git
   cd testing-stepfunctions-using-docker
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Start the Step Functions Local service using Docker Compose:

   ```sh
   docker-compose up -d
   ```

## Running Tests

1. Run the tests using Vitest:

   ```sh
   npm test
   ```

## License

This project is licensed under the ISC License.
