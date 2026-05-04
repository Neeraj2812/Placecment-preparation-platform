export default function Profile() {
  const user = localStorage.getItem("user");
  const email = localStorage.getItem("email");
  const history = JSON.parse(localStorage.getItem("history")) || [];

  return (
    <div>
      <h1>Profile</h1>

      <div className="card">
        <p><strong>Name:</strong> {user}</p>
        <p><strong>Email:</strong> {email}</p>
      </div>

      <div className="card">
        <h3>Badge History</h3>

        {history.length === 0 ? (
          <p>No badges earned yet</p>
        ) : (
          history.map((item, index) => (
            <p key={index}>
              {item.step} - {item.date}
            </p>
          ))
        )}
      </div>
    </div>
  );
}