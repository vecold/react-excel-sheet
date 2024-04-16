interface IShell {
  children: React.ReactElement;
  data?: unknown;
  className?: string;
}

const DefaultShell: React.FC<IShell> = ({ children, className }) => (
  <table className={className}>
    <tbody>{children}</tbody>
  </table>
);

export default DefaultShell;
