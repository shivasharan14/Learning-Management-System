
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminUsers.module.css";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const toggleUserStatus = async (userId) => {
    try {
      const response = await axiosInstance.put(
        `/admin/users/${userId}/status`
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                isActive: response.data.user.isActive,
              }
            : user
        )
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    axiosInstance
      .get("/admin/users")
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        user.name?.toLowerCase().includes(searchValue) ||
        user.email?.toLowerCase().includes(searchValue);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.length - activeUsers;
  const instructors = users.filter(
    (user) => user.role === "instructor"
  ).length;
  const students = users.filter(
    (user) => user.role === "student"
  ).length;

  return (
    <div className={styles.page}>
      <div className={styles.glowOne}></div>
      <div className={styles.glowTwo}></div>

      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <span className={styles.eyebrow}>
              ADMIN CONTROL CENTER
            </span>

            <h1>
              User Management
              <span>.</span>
            </h1>

            <p>
              Manage users, roles and account access across LearnHub.
            </p>
          </div>

          <div className={styles.totalBadge}>
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
        </div>

        {/* Summary cards */}
        <div className={styles.summaryGrid}>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.purple}`}>
              👥
            </div>

            <div>
              <span>Total Users</span>
              <strong>{users.length}</strong>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.green}`}>
              ✓
            </div>

            <div>
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.orange}`}>
              ◷
            </div>

            <div>
              <span>Inactive Users</span>
              <strong>{inactiveUsers}</strong>
            </div>
          </div>

          <div className={styles.summaryCard}>
            <div className={`${styles.summaryIcon} ${styles.blue}`}>
              ◈
            </div>

            <div>
              <span>Instructors</span>
              <strong>{instructors}</strong>
            </div>
          </div>

        </div>

        {/* Main panel */}
        <section className={styles.panel}>

          {/* Toolbar */}
          <div className={styles.toolbar}>

            <div>
              <span className={styles.sectionLabel}>
                PLATFORM USERS
              </span>

              <h2>All Users</h2>
            </div>

            <div className={styles.controls}>

              {/* Search */}
              <div className={styles.searchBox}>
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Role filter */}
              <select
                className={styles.filter}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>

            </div>
          </div>

          {/* Result info */}
          <div className={styles.resultBar}>
            <span>
              Showing <strong>{filteredUsers.length}</strong> of{" "}
              <strong>{users.length}</strong> users
            </span>

            {(search || roleFilter !== "all") && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.loader}></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>👥</div>
              <h3>No users found</h3>
              <p>
                There are currently no users registered on the platform.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>⌕</div>
              <h3>No matching users</h3>
              <p>
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <>

              {/* Desktop table */}
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>USER</th>
                      <th>ROLE</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>

                        {/* User */}
                        <td>
                          <div className={styles.userInfo}>
                            <div className={styles.avatar}>
                              {user.name
                                ?.charAt(0)
                                ?.toUpperCase()}
                            </div>

                            <div>
                              <strong>{user.name}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td>
                          <span
                            className={`${styles.roleBadge} ${
                              user.role === "admin"
                                ? styles.adminRole
                                : user.role === "instructor"
                                ? styles.instructorRole
                                : styles.studentRole
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              user.isActive
                                ? styles.active
                                : styles.inactive
                            }`}
                          >
                            <span></span>
                            {user.isActive
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Action */}
                        <td>
                          <button
                            className={`${styles.statusButton} ${
                              user.isActive
                                ? styles.deactivate
                                : styles.activate
                            }`}
                            onClick={() =>
                              toggleUserStatus(user._id)
                            }
                          >
                            {user.isActive
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className={styles.mobileList}>
                {filteredUsers.map((user) => (
                  <div
                    className={styles.mobileCard}
                    key={user._id}
                  >
                    <div className={styles.mobileTop}>
                      <div className={styles.userInfo}>
                        <div className={styles.avatar}>
                          {user.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </div>

                        <div>
                          <strong>{user.name}</strong>
                          <span>{user.email}</span>
                        </div>
                      </div>

                      <span
                        className={`${styles.statusBadge} ${
                          user.isActive
                            ? styles.active
                            : styles.inactive
                        }`}
                      >
                        <span></span>
                        {user.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className={styles.mobileDetails}>
                      <span
                        className={`${styles.roleBadge} ${
                          user.role === "admin"
                            ? styles.adminRole
                            : user.role === "instructor"
                            ? styles.instructorRole
                            : styles.studentRole
                        }`}
                      >
                        {user.role}
                      </span>

                      <button
                        className={`${styles.statusButton} ${
                          user.isActive
                            ? styles.deactivate
                            : styles.activate
                        }`}
                        onClick={() =>
                          toggleUserStatus(user._id)
                        }
                      >
                        {user.isActive
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

            </>
          )}

        </section>

        {/* Footer note */}
        <div className={styles.footerNote}>
          <span>●</span>
          User status changes are applied immediately.
        </div>

      </div>
    </div>
  );
};

export default AdminUsers;

