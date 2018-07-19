import React from "react";
import {Redirect} from 'react-router';
import {SortableContainer, SortableElement, SortableHandle, arrayMove,} from 'react-sortable-hoc';
import Project from './components/Project.jsx';

const SortableItem = SortableElement(({scene, projectId, updateOrder, editCallback}) =>
    <div >
        <Project key={scene.index} desc={scene.desc} thumbnail={scene.thumbnail} order={scene.order} projectId={projectId} updateOrder={updateOrder} editCallback={editCallback} />
    </div>
);

const SortableList = SortableContainer(({scenes, projectId, updateOrder, editCallback}) => {
    return (
        <div>
            {scenes.map((scene, index) => (
                <SortableItem key = {`item-${index}`} index={index} scene={scene} projectId={projectId} updateOrder={updateOrder} editCallback={editCallback}/>
            ))}
        </div>
    );
});

export default class CreateProject extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            projectId: this.props.location.state.projectId,
            redirectProjects: false,
            thumbnail: this.props.location.state.thumbnail,
            file: null,
            photo_thumbnail: null,
            scenes: [],
            numScenes: 0,
            project_title: "",
            project_description: "",
            embedUrl: null,
            showShare: false,
            showModal: false,
            showUpload: false,
            showUpdate: false,
            photo_caption: null,
            current_photo: null,
            photoId: null
        };
        this.selectText = this.selectText.bind(this);
        this.updatePhoto = this.updatePhoto.bind(this);
        this.editPhoto = this.editPhoto.bind(this);
        this.uploadPhoto = this.uploadPhoto.bind(this);
        this.goToProjects = this.goToProjects.bind(this);
        this.updateTitles = this.updateTitles.bind(this);
        this.updateOrder = this.updateOrder.bind(this);
        this.publish = this.publish.bind(this);
        this.fetchPhotos = this.fetchPhotos.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.fileChangedHandler = this.fileChangedHandler.bind(this);
    }

    componentDidMount() {
        this.fetchPhotos()
    }

    fetchPhotos() {
        const url = "/project-details/" + this.state.projectId;
        fetch(url, {
                'credentials': 'include'
        })
        .then(res => res.json())
        .then(
            (result) => {

                let project_title = result.title;
                if (result.title) {
                    document.getElementById('title-input').value = result.title;
                } else {
                    document.getElementById('title-input').placeholder = "Untitled";
                    project_title = "Untitled"
                };

                this.setState({
                    scenes: result.scenesData,
                    project_title: project_title,
                    project_description: result.desc,
                    numScenes: result.scenesData.length
                });

                if (result.desc) {
                    document.getElementById('project-description').value = result.desc;
                } else {
                    document.getElementById('project-description').placeholder = "Add a description";
                };

            },

            (error) => {
                this.setState({
                    error
                });
            }
        )
    }

    goToProjects() {
        this.setState({
            redirectProjects: true
        });
    }



    updateTitles() {
        const url = "/project-details/" + this.state.projectId;
        var titleData = document.getElementById('title-input').value;
        var descData = document.getElementById('project-description').value;
        var data = {
            titleData: titleData,
            descData: descData,
            sceneData: this.state.scenes
        };
        fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.fetchPhotos();
            },
            (error) => {
                this.setState({
                    error
                });
            }
        )
    }

    publish() {
        const url = "/publish/" + this.state.projectId;
        var titleData = document.getElementById('title-input').value;
        var descData = document.getElementById('project-description').value;
        var data = {
            titleData: titleData,
            descData: descData,
            sceneData: this.state.scenes
        };

        fetch(url, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
        })
        .then(res => res.json())
        .then(
            (result) => {
                if (result.embed_url) {
                    this.setState({embedUrl: result['embed_url'], showShare: true, showModal: true}, () => {
                        this.revealModal();
                    });
                } else {
                    console.log("No embed_url so skipping modal; result:");
                    console.log(result)
                }
            },
            (error) => {
                this.setState({
                    error
                });
            }
        );

    }

    onSortEnd({oldIndex, newIndex}) {
        const {scenes} = this.state;
        var tempScenes = arrayMove(scenes, oldIndex, newIndex);
        this.setState({scenes: tempScenes});
        this.updateOrder();
    }

    updateOrder() {
        const {scenes} = this.state;
        var tempScenes = this.state.scenes;
        for (let i = 0; i < scenes.length; i++) {
            tempScenes[i].order = i;
        }
        this.setState({scenes: tempScenes});
        this.updateTitles();
    }

    uploadPhoto() {
        const url = `/upload-image/${this.state.projectId}/${this.state.numScenes}`;

        let caption = document.getElementById('photo-description-input'),
            fileField = document.getElementById('file-object'),
            formData = new FormData();


        formData.append('order', this.state.numScenes);
        formData.append('file', this.state.file);
        formData.append('caption', caption.value);
        formData.append('sceneId', this.state.photoId);
        document.getElementById('modal-loading').style.display = "flex";
        fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(
            (result) => {
                document.getElementById('modal-loading').style.display = "none";
                this.setState({showUpload: false, showModal: false}, () => {
                    this.fetchPhotos();
                });
            },
            (error) => {
                console.log(`Error Uploading ${error}`)
            }
        )
    }

    editPhoto(order) {
        console.log("EDIT PHOTO");
        const url = `/upload-image/${this.state.projectId}/${order}`;
        console.log(order);
        fetch(url, {'credentials': 'include'})
        .then(res => res.json())
        .then(
            (result) => {
                if (result.scene_exists == 'True'){

                    this.setState({
                        photo_thumbnail: result.scene_thumbnail,
                        photoId: result.scene_id,
                        photo_caption: result.desc,
                        showUpdate: true,
                        current_photo: order,
                        showModal: true
                    }, () => {
                        this.revealModal();
                    });
                }
            },
            (error) => {
                console.log("ERROR fetching info from server")
            }
        )
    }

    updatePhoto() {

        const url = `/update-image/${this.state.projectId}/${this.state.current_photo}`;
        let caption = document.getElementById('photo-description-input'),
            formData = new FormData();

        formData.append('order', this.state.current_photo);
        formData.append('caption', caption.value);
        formData.append('sceneId', this.state.photoId);

        fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        })
        .then(res => res.json())
        .then(
            (result) => {
                this.setState({showUpdate:false, showModal: false}, () => {
                    this.fetchPhotos();
                });
            },
            (error) => {
                console.log(`Error Uploading ${error}`)
            }
        )

    }

    revealModal() {
        setTimeout(() => {
            document.getElementById('modal-overlay').style.opacity = "1";
            document.getElementById('modal').style.bottom = "0";
        }, 100)
    }

    closeModal() {
        document.getElementById('modal-overlay').style.opacity = "0";
        document.getElementById('modal').style.bottom = "-80vh";
        setTimeout(() => {
            this.setState({showShare: false, showModal: false, showUpdate:false, showUpload:false})
        }, 400)
        document.getElementById("file-object").value = "";
    }

    selectText(t) {
        let el = document.getElementById(t);
        if (el) {
            el.focus();
            el.select();
        }
    }

    fileChangedHandler(event) {
        const url = "/upload-image/" + this.state.projectId + "/" + this.state.numScenes;
        let reader = new FileReader(),
            file = event.target.files[0],
            caption = null;

        fetch(url, {'credentials': 'include'})
        .then(res => res.json())
        .then(
            (result) => {
                if (result.scene_exists == 'True'){

                    this.setState({
                        photo_thumbnail: result.scene_thumbnail,
                        photoId: result.scene_id,
                        photo_caption: result.desc
                    });
                }
            },
            (error) => {
                console.log("ERROR fetching info from server")
            }
        )

        reader.onloadend = () => {
            if (reader.result) {
                this.setState({
                    file: file,
                    photo_thumbnail: reader.result,
                    photo_caption: caption,
                    showUpload: true,
                    showModal: true
                }, () => {
                    this.revealModal();
                });
            } else {
                reader.abort();
                document.getElementById("file-object").value = "";
            }

        }
        reader.readAsDataURL(file);

    }

    render() {
        const {redirectProjects, showShare, showModal, showUpload, showUpdate, scenes, photo_thumbnail, photo_caption, photoId, project_title, project_description} = this.state;

        if (redirectProjects) {
            return ( <Redirect to = {{pathname: '/list-projects', push: true}}/>);
        }

        let modal = null,
            modal_body = null,
            share = {
                description: "",
                embed: null,
                url: this.state.embedUrl,
                url_encoded: null,
                facebook: null,
                twitter: null
            },
            image_preview = null,
            modal_title = "",
            modal_header = ["", "", ""],
            modal_type = "modal-content",
            modal_footer = "",
            modal_loading = "";



        if (this.state.photo_thumbnail) {
            image_preview = (<img src={photo_thumbnail} />);
        } else {
            image_preview = (<div id="upload-placeholder"><span className="icon-image"></span></div>);
        }
        if (showModal) {

            if (showShare) {
                if (this.state.embedUrl) {
                    share.url_encoded = encodeURIComponent(share.url);
                    share.embed = `<iframe width="100%" height="600" src=${share.url} frameborder="0" allowfullscreen />`;

                    if (this.state.project_description) {
                        share.description = `: ${this.state.project_description}`;
                    }
                    share.twitter = `http://twitter.com/share?text=${this.state.project_title}${share.description}&url=${share.url}&hashtags=SceneVR,knightlab,VR&via=knightlab`;

                    share.facebook = `https://www.facebook.com/dialog/feed?app_id=1986212374732747&display=page&picture=${encodeURIComponent(this.state.thumbnail)}&caption=${encodeURIComponent("SceneVR")}&name=${encodeURIComponent(this.state.project_title)}&description=${encodeURIComponent(share.description)}&link=${share.url_encoded}&redirect_uri=${share.url_encoded}`;

                    modal_title = "Share";

                    modal_type = "modal-content modal-content-incl";

                    modal_header[1] = "Share";

                    modal_footer = (
                        <div className="modal-close">
                            <button className="close-button" id="close-button" onClick={this.closeModal}>Cancel</button>
                        </div>
                    );

                    modal_body = (
                        <div className="modal-body">
                            <img src={this.state.thumbnail} alt="Preview thumbnail"/>
                            <h4>{this.state.project_title}</h4>
                            <p>{this.state.project_description}</p>
                            <div className="modal-list">
                                <div className="modal-list-item">
                                    <span className="icon-link"></span>
                                </div>
                                <div className="modal-list-item">
                                    <input id="share-link" aria-label="Shareable link" className="share-url" type="text" onClick={()=>{this.selectText("share-link")}} value={this.state.embedUrl} readOnly />
                                </div>
                            </div>
                            <div className="modal-list">
                                <div className="modal-list-item">
                                    <span className="icon-embed2"></span>
                                </div>
                                <div className="modal-list-item">
                                    <textarea aria-label="Embed code" id="share-embed" className="share-url" rows="4" type="text" onClick={() => {this.selectText("share-embed")}} value={share.embed} readOnly />
                                </div>
                            </div>
                            <div className="modal-link-list">
                                <a className="modal-action-button" aria-label="Open sharable link in new tab" href={share.url} target="_blank">
                                    <div className="modal-action-button-content">
                                        <span className="icon-new-tab"></span>
                                    </div>
                                    Preview
                                </a>
                                <a className="modal-action-button" aria-label="Share on Twitter" href={share.twitter} target="_blank">
                                    <div className="modal-action-button-content">
                                        <span className="icon-twitter"></span>
                                    </div>
                                    Twitter
                                </a>
                                <a className="modal-action-button" aria-label="Share on Facebook" href={share.facebook} target="_blank">
                                    <div className="modal-action-button-content">
                                        <span className="icon-facebook2"></span>
                                    </div>
                                    Facebook
                                </a>
                            </div>
                        </div>
                    );

                } else {
                    console.warn('showShare is true but this.state.embedUrl is null. This should not be.')
                }
            }
            if (showUpload || showUpdate) {
                modal_header[0] = (<div className="modal-header-button" onClick={this.closeModal}> Cancel </div>);
                modal_header[1] = "Upload";
                modal_header[2] = (<div className="modal-header-button" onClick={this.uploadPhoto}> Upload </div>);
                modal_loading = (<div id="modal-loading"><div id="modal-uploading-message">Uploading</div></div>)
                modal_body = (
                    <div className="modal-body">
                        <div id="upload-thumbnail">
                            {image_preview}
                        </div>
                        <div id="upload-description">
                            <textarea id="photo-description-input" rows="5" type="text" aria-label="Description of photo" placeholder="Add a description" />
                        </div>
                    </div>
                );
            }

            if (showUpdate) {
                modal_header[1] = "Update";
                modal_header[2] = (<div className="modal-header-button" onClick={this.updatePhoto}> Update </div>);
            }

            modal = (
                <div>
                    <div className="modal-overlay" id="modal-overlay"></div>
                    <div className="modal" id="modal">
                        <div className={modal_type}>
                            {modal_loading}
                            <div className="modal-header">
                                <div className="modal-header-item">
                                    {modal_header[0]}
                                </div>
                                <div className="modal-header-item">
                                    <h3>{modal_header[1]}</h3>
                                </div>
                                <div className="modal-header-item">
                                    {modal_header[2]}
                                </div>
                            </div>
                            {modal_body}
                        </div>
                        {modal_footer}
                    </div>
                </div>
            );

        }


        return (
            <div id="CreateProject">

                {modal}

                <div id="create-header">
                    <div id="header-left">
                        <div id="nav-title" className="link" onClick={this.goToProjects}> &lt; Your Projects </div>
                    </div>
                    <div id="header-right">
                        <div id="publish" onClick={this.publish}> <span className="icon-share"></span></div>
                    </div>
                </div>

                <div id="create-project-content">
                    <input id="title-input" type="text" onBlur={this.updateTitles}/>
                    <textarea rows="3" id="project-description" type="text" onBlur={this.updateTitles} />
                    <div id="scenes-container">
                        <SortableList scenes={scenes} updateOrder={this.updateOrder} projectId={this.state.projectId} onSortEnd={this.onSortEnd.bind(this)} useDragHandle={true} editCallback={this.editPhoto}/>

                        <label id="add-scene-button" htmlFor="file-object">
                            <span className="icon-image"></span> <br/>Add Photo
                        </label>
                        <input id="file-object" type="file" accept=".jpg, .jpeg" onChange={this.fileChangedHandler} />


                    </div>
                </div>

            </div>
        );
    }
}
