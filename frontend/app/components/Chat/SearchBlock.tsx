import {
  Autocomplete,
  Avatar,
  CircularProgress,
  InputAdornment,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import { Fragment, useState } from "react";
type Option = { name: string; id: string; image: string };

export default function SearchBlock({
  // currentOption,
  options,
  isLoading,
  onSearchUsers,
  onSectedUser,
}: {
  currentOption: Option | null;
  options: Option[];
  isLoading: boolean;
  onSectedUser: (userId: string) => Promise<void>;
  onSearchUsers: (query: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <Autocomplete
      // value={currentOption}
      // onChange={onSectedUser}
      open={open}
      onOpen={() => {
        setOpen(true);
        onSearchUsers(query);
      }}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      getOptionLabel={(option) => option.name}
      options={options}
      loading={isLoading}
      renderOption={(props, option) => (
        // 1. 使用 ListItem 包裝整個選項，並傳遞 Autocomplete 要求的 props
        <ListItem
          {...props}
          key={option.id}
          onClick={() => {
            setOpen(false);
            onSectedUser(option.id);
          }}
        >
          {/* 2. 放置頭像 */}
          <ListItemAvatar>
            <Avatar src={option.image} alt={option.name} />
          </ListItemAvatar>

          {/* 3. 放置名稱 */}
          <ListItemText primary={option.name} />
        </ListItem>
      )}
      renderInput={(params) => (
        <TextField
          //
          {...params}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          variant="outlined"
          placeholder="search..."
          size="small"
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 999,
            },
          }}
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <Fragment>
                  {isLoading ? (
                    <CircularProgress color="inherit" size={20} />
                  ) : null}
                  {params.InputProps.endAdornment}
                </Fragment>
              ),
            },
          }}
        />
      )}
    />
  );
}
