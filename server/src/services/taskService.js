import mongoose from "mongoose";
import { Meeting } from "../models/Meeting.js";
import { Task } from "../models/Task.js";
import { HttpError } from "../utils/httpError.js";
import { assertUserBelongsToTeam, requireTeamMembership } from "./teamService.js";

function assertId(id, label = "id") {
  if (!mongoose.isValidObjectId(id)) throw new HttpError(400, `Invalid ${label}`);
}

async function validateTaskRelationships(payload, teamId) {
  if (payload.assignee) {
    await assertUserBelongsToTeam(teamId, payload.assignee, "assignee");
  }

  if (payload.meeting) {
    const meeting = await Meeting.exists({ _id: payload.meeting, team: teamId });
    if (!meeting) throw new HttpError(422, "meeting must belong to the same team");
  }
}

export async function createTask(userId, payload) {
  await requireTeamMembership(payload.team, userId);
  await validateTaskRelationships(payload, payload.team);

  return Task.create({
    title: payload.title.trim(),
    description: payload.description?.trim() ?? "",
    team: payload.team,
    meeting: payload.meeting ?? null,
    assignee: payload.assignee ?? null,
    createdBy: userId,
    dueAt: payload.dueAt ?? null,
  });
}

export async function listTasks(userId, teamId) {
  await requireTeamMembership(teamId, userId);
  return Task.find({ team: teamId })
    .sort({ createdAt: -1 })
    .populate("assignee", "name email")
    .populate("createdBy", "name email");
}

export async function updateTask(userId, taskId, payload) {
  assertId(taskId, "task id");
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, "Task not found");

  await requireTeamMembership(task.team, userId);
  if (payload.assignee !== undefined && payload.assignee !== null) {
    await assertUserBelongsToTeam(task.team, payload.assignee, "assignee");
  }

  const allowed = ["title", "description", "assignee", "status", "dueAt"];
  for (const key of allowed) {
    if (payload[key] !== undefined) task[key] = payload[key];
  }

  await task.save();
  return task;
}

export async function deleteTask(userId, taskId) {
  assertId(taskId, "task id");
  const task = await Task.findById(taskId);
  if (!task) throw new HttpError(404, "Task not found");

  const team = await requireTeamMembership(task.team, userId);
  const isOwner = String(team.owner) === String(userId);
  const isCreator = String(task.createdBy) === String(userId);
  if (!isOwner && !isCreator) {
    throw new HttpError(403, "Only the team owner or task creator can delete this task");
  }

  await task.deleteOne();
}
