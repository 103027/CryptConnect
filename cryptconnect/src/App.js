import React, { useState, useEffect } from "react";
import { Route, HashRouter as Router, Switch ,Redirect} from "react-router-dom";
import { db } from './firebase'
import { doc, setDoc, getDoc } from 'firebase/firestore';
import AppLayout from "./components/Layout/Layout";
import Register from "./pages/authentication/register";
import Login from "./pages/authentication/login";
import ResetPassword from "./pages/edit/resetPassword";
import Chat from "./pages/chat/chat";
import EditProfile from "./pages/edit/editProfile";

function App() {
  const [user, setUser] = useState(null); //User of the chat app initially set to null before log in

  var Crypto = require("crypto");
  let dh = Crypto.createDiffieHellman(20); //Creating a Diffie Hellman object 20 specifies the size of the prime number to use in bits.
  let primestring = dh.getPrime().toString("hex");  //Getting the DH Prime number
  let prime = parseInt(primestring, 16);

  var primitiveroot = [];
  primitiveroot = findPrimitive(prime); //Getting few primitive roots in a range for the prime number 
  let generator = primitiveroot[Math.floor(Math.random() * primitiveroot.length)];  //Choosing a random primitive root from the array as the DH generator


  useEffect(() => {
    setInterval(() => setdhparams(prime, generator), 1000);  //Setting the DH parameters into the database
  }, []);

  return (
    <div>
      <Router>
        <Switch>
          <Route exact path="/">
            <Redirect to="/login" />
          </Route>
          <Route path="/chat">
            <AppLayout user={user} setUser={setUser}>
              <Chat user={user} setUser={setUser} />
            </AppLayout>
          </Route>
          <Route path="/register">
            <AppLayout user={user} setUser={setUser}>
              <Register />
            </AppLayout>
          </Route>
          <Route path="/resetpassword">
            <AppLayout user={user} setUser={setUser}>
              <ResetPassword user={user} setUser={setUser} />
            </AppLayout>
          </Route>
          <Route path="/editprofile">
            <AppLayout user={user} setUser={setUser}>
              <EditProfile user={user} setUser={setUser} />
            </AppLayout>
          </Route>
          <Route path="/login">
            <AppLayout user={user} setUser={setUser}>
              <Login user={user} setUser={setUser} />
            </AppLayout>
          </Route>
        </Switch>
      </Router>
    </div>
  );
}

async function setdhparams(prime, generator) //Function to create the Diffie Hellman parameters
{
  const dhRef = doc(db, "dhparameters", "dh");  //Reference of the firebase document for the DH parameters
  const docSnap = await getDoc(dhRef);  //Getting the DH parameters document

  if (!docSnap.exists()) {
    await setDoc(doc(db, "dhparameters", "dh"), { //Setting the DH parameters to the document
      prime: prime,
      generator: generator,
    });
  }
}

// Iterative Function to calculate (x^n)%p 
function power(a, b, p) {
  let res = 0; //Initialize result
  a = a % p;
  while (b > 0) {
    // If b is odd, add 'a' to result
    if (b % 2 === 1) {
      res = (res + a) % p;
    }

    // Multiply 'a' with 2
    a = (a * 2) % p;

    // Divide b by 2
    b = b / 2;
  }

  // Return result
  return res % p;
}

// Function to store prime factors of a number
function findPrimefactors(s, n) {
  // Print the number of 2s that divide n
  while (n % 2 === 0) {
    s.add(2);
    n = n / 2;
  }
  // n must be odd at this point. So we can skip one element (Note i = i +2)
  for (let i = 3; i <= Math.sqrt(n); i = i + 2) {
    // While i divides n, print i and divide n
    while (n % i === 0) {
      s.add(i);
      n = n / i;
    }
  }
  // This condition is to handle the case when n is a prime number greater than 2
  if (n > 2)
    s.add(n);
}

// Function to find smallest primitive root of n
function findPrimitive(n) {
  let s = new Set();
  let primitiveroots = [];
  // Find value of Euler Totient function of n
  let phi = n - 1;
  // Find prime factors of phi and store in a set
  findPrimefactors(s, phi);
  // Check for every number from 2 to phi
  for (let r = 20; r <= 200; r++) {
    // Iterate through all prime factors of phi and check if we found a power with value 1
    let flag = false;
    for (let it of s) {
      // Check if r^((phi)/primefactors) mod n is 1 or not
      if (power(r, phi / it, n) == 1) {
        flag = true;
      }
    }
    // If there was no power with value 1.
    if (flag === false)
      primitiveroots.push(r);
  }
  return primitiveroots;
}

export default App;