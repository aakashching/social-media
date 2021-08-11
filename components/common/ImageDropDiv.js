import { Form, Segment, Image, Icon, Header } from "semantic-ui-react";
import { useRouter } from "next/router";
const ImageDropDiv = ({
  highlighted,
  setHighlighted,
  inputRef,
  handleChange,
  mediaPreview,
  setMediaPreview,
  setMedia,
  profilePicUrl,
}) => {
  const router = useRouter();
  const signUpRoute = router.pathname === "/signup";
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            onChange={handleChange}
            name="media"
            ref={inputRef}
          />
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setHighlighted(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setHighlighted(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setHighlighted(true);
              const dropedFile = Array.from(e.dataTransfer.files);
              setMedia(dropedFile[0]);
              setMediaPreview(URL.createObjectURL(dropedFile[0]));
            }}
          >
            {mediaPreview === null ? (
              <>
                <Segment
                  color={highlighted ? "green" : "grey"}
                  placeholder
                  basic
                >
                  {signUpRoute ? (
                    <Header icon>
                      <Icon
                        name="file image outline"
                        style={{ cursor: "pointer" }}
                        onClick={() => inputRef.current.click()}
                      />
                      Drag n Drop or click to uplode Image
                    </Header>
                  ) : (
                    <span style={{ textAlign: "center" }}>
                      <Image
                        src={profilePicUrl}
                        style={{ cursor: "pointer" }}
                        onClick={() => inputRef.current.click()}
                        size='large'
                        centered
                      />
                      <p>click to upload an image</p>
                    </span>
                  )}
                </Segment>
              </>
            ) : (
              <>
                <Segment color="green" placeholder basic>
                  <Image
                    src={mediaPreview}
                    size="medium"
                    centered
                    style={{ cursor: "pointer" }}
                    onClick={()=> inputRef.current.click()}
                  />
                </Segment>
              </>
            )}
          </div>
        </Segment>
      </Form.Field>
    </>
  );
};
export default ImageDropDiv;
