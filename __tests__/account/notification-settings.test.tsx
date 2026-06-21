import { render, screen, fireEvent } from "@testing-library/react";
import { NotificationSettings } from "@/components/account/notification-settings";

test("renders toggle with current enabled state", () => {
  render(
    <NotificationSettings
      enabled={true}
      notificationTime="08:00"
      onToggle={vi.fn()}
      onTimeChange={vi.fn()}
    />
  );
  expect(screen.getByRole("checkbox", { name: /morning notification/i })).toBeChecked();
});

test("renders toggle unchecked when disabled", () => {
  render(
    <NotificationSettings
      enabled={false}
      notificationTime="08:00"
      onToggle={vi.fn()}
      onTimeChange={vi.fn()}
    />
  );
  expect(screen.getByRole("checkbox", { name: /morning notification/i })).not.toBeChecked();
});

test("toggle calls onToggle", () => {
  const onToggle = vi.fn();
  render(
    <NotificationSettings
      enabled={false}
      notificationTime="08:00"
      onToggle={onToggle}
      onTimeChange={vi.fn()}
    />
  );
  fireEvent.click(screen.getByRole("checkbox", { name: /morning notification/i }));
  expect(onToggle).toHaveBeenCalled();
});

test("time picker shows current time", () => {
  render(
    <NotificationSettings
      enabled={true}
      notificationTime="09:00"
      onToggle={vi.fn()}
      onTimeChange={vi.fn()}
    />
  );
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("09:00");
});

test("time picker calls onTimeChange on selection", () => {
  const onTimeChange = vi.fn();
  render(
    <NotificationSettings
      enabled={true}
      notificationTime="08:00"
      onToggle={vi.fn()}
      onTimeChange={onTimeChange}
    />
  );
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "07:30" } });
  expect(onTimeChange).toHaveBeenCalledWith("07:30");
});

test("time picker is hidden when notifications disabled", () => {
  render(
    <NotificationSettings
      enabled={false}
      notificationTime="08:00"
      onToggle={vi.fn()}
      onTimeChange={vi.fn()}
    />
  );
  expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
});

test("time picker has 05:00 as first option and 10:00 as last", () => {
  render(
    <NotificationSettings
      enabled={true}
      notificationTime="08:00"
      onToggle={vi.fn()}
      onTimeChange={vi.fn()}
    />
  );
  const select = screen.getByRole("combobox") as HTMLSelectElement;
  const options = Array.from(select.options).map((o) => o.value);
  expect(options[0]).toBe("05:00");
  expect(options[options.length - 1]).toBe("10:00");
});
