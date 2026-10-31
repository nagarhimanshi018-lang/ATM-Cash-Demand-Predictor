from ortools.linear_solver import pywraplp


def optimize_cash(predicted_demand, available_cash):
    solver = pywraplp.Solver.CreateSolver("SCIP")

    if solver is None:
        raise RuntimeError("OR-Tools solver could not be created")

    # Cash allocation must be non-negative and cannot exceed available cash
    cash_to_load = solver.NumVar(
        0, available_cash, "cash_to_load"
    )

    # Meet the predicted demand
    solver.Add(cash_to_load >= predicted_demand)

    # Minimize the cash loaded into the ATM
    solver.Minimize(cash_to_load)

    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        return round(cash_to_load.solution_value(), 2)

    return None